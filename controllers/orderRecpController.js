import OrderRecap from '@/models/orderRecapModel'
import Order from '@/models/orderModel'
import User from '@/models/userModel'
import Amap from '@/models/amapModel'

import { sendEmail } from '@/lib/sendmail'

import dbConnect from '@/lib/dbConnect.js'

dbConnect()

// @desc    Update Order details
// @route   PUT /api/orders
// @access  Private
const updateRecapDeliveryDate = async (req, res) => {
	const recap = await OrderRecap.findById(req.body._id)

	if (recap) {
		recap.delivery = req.body.date || recap.delivery
		const newRecap = await recap.save()

		const amapsOrders = await Order.find({
			amap: recap.amap,
			session: recap.session,
		})
			.populate({
				path: 'client',
				select: ['name', 'email'],
				model: User,
			})
			.populate({
				path: 'amap',
				select: ['name'],
				model: Amap,
			})

		for (let index = 0; index < amapsOrders.length; index++) {
			const amap = amapsOrders[index].amap
			const user = amapsOrders[index].client

			const options = {
				weekday: 'long',
				day: 'numeric',
				month: 'long',
				year: 'numeric',
			}

			let mailData = {
				from: '"Juju 2 Fruits" <juju2fruits64@gmail.com>',
				to: user.email,
				subject:
					'Date de livraison de votre commande sur juju2fruits.com',
				text: `
                    Bonjour ${user.name}.\n
                    Vous allez pouvoir récupérer votre commande\n
                    le ${new Date(newRecap.delivery).toLocaleDateString(
						'fr-FR',
						options
					)} à l'amap de ${amap.name}
                    Cordialement,\n
                    Juju2Fruits
                `,
				html: `
                    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
                    <html>
                        <head>
                            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                        </head>
                        <body>
                            <p>
                                Bonjour ${user.name}. 
                            </p>
                            <p>
                                Vous allez pouvoir récupérer votre commande <br />
                                le ${new Date(
									newRecap.delivery
								).toLocaleDateString(
									'fr-FR',
									options
								)} à l'amap de ${amap.name}
                            </p>
                            <p>
                                Cordialement,</br>
                                Juju2Fruits
                            </p>
                        </body>
                    </html>
                `,
			}
			await sendEmail(mailData)
		}

		res.status(200).json(newRecap)
	} else {
		res.status(404).json({ message: 'Recapitulatif introuvable...' })
	}
}

export { updateRecapDeliveryDate }
