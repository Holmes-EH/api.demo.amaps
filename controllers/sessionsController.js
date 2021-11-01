import Session from '@/models/sessionModel'
import Amap from '@/models/amapModel'
import Product from '@/models/productModel'
import OrderRecap from '@/models/orderRecapModel'

import dbConnect from '@/lib/dbConnect.js'

dbConnect()

// @desc    Add a new session
// @route   POST /api/sessions
// @access  Private + admin
const addNewSession = async (req, res) => {
	const { session, isOpen } = req.body
	const sessionExists = await Session.findOne({ session })

	if (sessionExists) {
		res.status(400).json({
			mesage: `Cette session existe déjà...\nMettez la à jour -> ${sessionExists._id} ?`,
		})
	} else {
		const newSession = await Session.create({
			session,
			isOpen,
		})

		if (newSession) {
			const amaps = await Amap.find()
			const products = await Product.find().sort('title').select('_id')
			let productArray = []
			products.forEach((product) => {
				productArray.push({ product: product._id, quantity: 0 })
			})
			for (let index = 0; index < amaps.length; index++) {
				let orderRecapExists = await OrderRecap.findOne({
					amap: amaps[index],
					session,
				})
				if (!orderRecapExists) {
					await OrderRecap.create({
						products: productArray,
						session,
						amap: amaps[index],
					})
				}
			}

			res.status(201).json({
				_id: newSession._id,
				session: newSession.session,
				isOpen: newSession.isOpen,
				lastOrderDate: newSession.lastOrderDate,
			})
		} else {
			res.status(400).json({ message: 'Données de session éronnées.' })
		}
	}
}

// @desc    Get session by session
// @route   Get /api/sessions
// @access  Private
const getSessions = async (req, res) => {
	if (req.query.id) {
		const session = await Session.findById(req.query.id)

		if (session) {
			res.status(200).json({
				_id: session._id,
				session: session.session,
				isOpen: session.isOpen,
				lastOrderDate: session.lastOrderDate,
				news: session.news,
			})
		} else {
			res.status(400).json({ message: 'Session introuvable...' })
		}
	} else if (req.query.session) {
		const session = parseInt(req.query.session)
		const foundSession = await Session.find({ session })

		if (foundSession.length > 0) {
			res.status(200).json({
				_id: foundSession[0]._id,
				session: foundSession[0].session,
				isOpen: foundSession[0].isOpen,
				lastOrderDate: foundSession[0].lastOrderDate,
				news: foundSession[0].news,
			})
		} else {
			res.status(200).json([])
		}
	} else if (req.query.current) {
		const today = new Date()
		const foundSession = await Session.find({
			lastOrderDate: { $gte: today },
		}).limit(1)
		if (foundSession.length > 0) {
			res.status(200).json({
				_id: foundSession[0]._id,
				session: foundSession[0].session,
				isOpen: foundSession[0].isOpen,
				lastOrderDate: foundSession[0].lastOrderDate,
				news: foundSession[0].news,
			})
		} else {
			res.status(200).json([])
		}
	} else {
		const sessions = await Session.find()

		if (sessions) {
			res.status(200).json({
				sessions,
			})
		} else {
			res.status(400).json({ message: 'Aucune session trouvée...' })
		}
	}
}

// @desc    Update session by session
// @route   put /api/sessions
// @access  Private + admin
const updateSession = async (req, res) => {
	const session = await Session.findById(req.body._id)

	if (session) {
		session.isOpen = req.body.isOpen || session.isOpen
		session.lastOrderDate = req.body.lastOrderDate || session.lastOrderDate
		session.news = req.body.news || session.news

		const updatedSession = await session.save()
		res.status(200).json(updatedSession)
	} else {
		res.status(404).json({ message: 'Session introuvable...' })
	}
}

// @desc    Delete session by session
// @route   put /api/sessions
// @access  Private + admin
const deleteSession = async (req, res) => {
	const session = await Session.findById(req.body._id)
	if (session) {
		await session.remove()
		res.status(200).json({ message: 'Commandes désautorisées.' })
	} else {
		res.status(404).json({ message: 'Aucune session trouvée...' })
	}
}

export { addNewSession, getSessions, updateSession, deleteSession }
