import Amap from '@/models/amapModel'
import Product from '@/models/productModel'
import OrderRecap from '@/models/orderRecapModel'
import Session from '@/models/sessionModel'
import dbConnect from '@/lib/dbConnect.js'
import generateAccessCode from '@/utils/generateAccessCode'
import { sendEmail } from '@/lib/sendmail'

dbConnect()

// @desc    Register a new amap
// @route   POST /api/amaps
// @access  Private + Admin
const registerAmap = async (req, res) => {
	const { name, contact, groupement, deliveryDay, deliveryTime } = req.body

	const amapExists = await Amap.findOne({ name })

	if (amapExists) {
		res.status(400).json({ message: 'Cette Amap existe déjà' })
	} else {
		const accessCode = await generateAccessCode(6)

		const amap = await Amap.create({
			name,
			contact,
			groupement,
			deliveryDay,
			deliveryTime,
			accessCode,
		})

		if (amap) {
			res.status(201).json({
				_id: amap._id,
				name: amap.name,
				contact: amap.contact,
				groupement: amap.groupement,
				deliveryDay: amap.deliveryDay,
				deliveryTime: amap.deliveryTime,
				accessCode: amap.accessCode,
			})
		} else {
			res.status(400).json({ message: 'Amap introuvable' })
		}
	}
}

// @desc    Get all amap details
// @route   Get /api/amaps
// @access  Public
const getAllAmaps = async (req, res) => {
	const amaps = await Amap.find({}).sort({ groupement: 'asc' })
	if (amaps) {
		res.status(200).json(amaps)
	} else {
		res.status(404).json({ message: 'Aucune Amap trouvée' })
	}
}

// @desc    Get amap details
// @route   Get /api/amaps/id
// @access  Public
const getAmapDetails = async (req, res) => {
	const amap = await Amap.findById(req.query.id)
	if (amap) {
		res.status(200).json({
			_id: amap._id,
			name: amap.name,
			contact: amap.contact,
			groupement: amap.groupement,
			deliveryDay: amap.deliveryDay,
			deliveryTime: amap.deliveryTime,
			accessCode: amap.accessCode,
		})
	} else {
		res.status(404).json({ message: 'Amap introuvable' })
	}
}

// @desc    Update Amap details
// @route   PUT /api/amaps
// @access  Private + Admin
const updateAmap = async (req, res) => {
	const amap = await Amap.findById(req.body.id)

	if (amap) {
		amap.name = req.body.name || amap.name
		amap.contact = req.body.contact || amap.contact
		amap.groupement = req.body.groupement || amap.groupement
		amap.deliveryDay = req.body.deliveryDay || amap.deliveryDay
		amap.deliveryTime = req.body.deliveryTime || amap.deliveryTime
		if (req.body.updateAccessCode) {
			amap.accessCode = await generateAccessCode(6)
		}
		const updatedAmap = await amap.save()
		res.json({
			_id: updatedAmap._id,
			name: updatedAmap.name,
			contact: updatedAmap.contact,
			groupement: updatedAmap.groupement,
			deliveryDay: amap.deliveryDay,
			deliveryTime: amap.deliveryTime,
			accessCode: updatedAmap.accessCode,
		})
	} else {
		res.status(404).json({ message: 'Amap introuvable' })
	}
}

// @desc    Delete Amap
// @route   DELETE /api/amap
// @access  Private + Admin
const deleteAmap = async (req, res) => {
	const amap = await Amap.findById(req.query.id)

	if (amap) {
		await amap.remove()
		res.json({ message: 'Amap supprimée' })
	} else {
		res.status(404).json({ message: 'Amap introuvable' })
	}
}

// @desc    Send mail to amap
// @route   POST /api/amaps/sendMail
// @access  Private + Admin
const sendMailToAmap = async (req, res) => {
	const { amapId, sessionId, messageObject, messageBody } = req.body
	const amap = await Amap.findById(amapId)
	const sessionDetails = await Session.findById(sessionId)
	// deepcode ignore HTTPSourceWithUncheckedType: this is a trusted route
	const formattedMessage = messageBody.replace(/(?:\r\n|\r|\n)/g, '<br>')
	if (amap) {
		const orderRecap = await OrderRecap.findOne({
			amap: amapId,
			session: sessionDetails.session,
		})
			.populate({
				path: 'products',
				populate: {
					path: 'product',
					select: ['_id', 'title', 'pricePerKg'],
					model: Product,
				},
			})
			.populate({
				path: 'amap',
				select: ['name', 'groupement'],
				model: Amap,
			})

		let htmlToSend = `
                <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
                <html>
                    <head>
                        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                    </head>
                    <body>
                        ${formattedMessage}
                    </body>
                    </html>
                    
            `
		let promiseArray = amap.contact.emails.map((email) => {
			let mailData = {
				from: `"Juju 2 Fruits" <nepasrepondre@juju2fruits.com>`,
				replyTo: `${process.env.ADMIN_EMAIL}`,
				to: email.email,
				subject: messageObject,
				text: messageBody,
				html: htmlToSend,
			}
			return sendEmail(mailData)
		})

		Promise.all(promiseArray)
			.then(async () => {
				orderRecap.notificationSent = true
				await orderRecap.save()
				res.status(200).json({ message: 'Email Envoyé !', orderRecap })
			})
			.catch((error) => {
				res.status(400).json({
					message:
						"Une erreur s'est produite lors de l'envoi des emails",
					error: error.response,
				})
			})
	} else {
		res.status(404).json({ message: 'Amap introuvable...' })
	}
}

// @desc    Check amap access code sent in body
// @route   POST /api/amaps/access
// @access  Public
const checkAmapCode = async (req, res) => {
	const amap = await Amap.findOne({ accessCode: req.body.amapCode }).select([
		'_id',
		'name',
	])
	if (amap) {
		res.status(200).json(amap)
	} else {
		res.status(404).json({
			message: 'Code amap erroné.\nAucune amap trouvée...',
		})
	}
}

export {
	registerAmap,
	getAllAmaps,
	getAmapDetails,
	updateAmap,
	deleteAmap,
	sendMailToAmap,
	checkAmapCode,
}
