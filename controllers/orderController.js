import Order from '@/models/orderModel'
import jwt from 'jsonwebtoken'

import dbConnect from '@/lib/dbConnect.js'
import { normalizeConfig } from 'next/dist/next-server/server/config-shared'

dbConnect()

// @desc    Add a new order
// @route   POST /api/order
// @access  Private
const newOrder = async (req, res) => {
	const { client, details, amap, session } = req.body

	const orderExists = await Order.findOne({ client, session })

	if (orderExists) {
		res.status(400).json({
			mesage: `Cette commande pour cet utilisateur et ce mois existe déjà\nMettez le à jour -> ${orderExists._id}`,
		})
	} else {
		const order = await Order.create({
			client,
			details,
			amap,
			session,
		})

		if (order) {
			res.status(201).json({
				_id: order._id,
				client: order.client,
				details: order.details,
				amap: order.amap,
				session: order.session,
			})
		} else {
			res.status(400).json({ message: 'Données de commande érronés' })
		}
	}
}

// @desc    Get orders
// @route   Get /api/orders/id
// @access  Private
const getSingleOrder = async (req, res) => {
	const order = await Order.findById(req.query.id)
	if (order) {
		res.status(200).json({
			_id: order._id,
			client: order.client,
			details: order.details,
			amap: order.amap,
			session: order.session,
		})
	} else {
		res.status(400).json({
			message: "Cette commande n'est pas dans la base de données.",
		})
	}
}

// @desc    Get orders
// @route   Get /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
	const token = req.headers.authorization.split(' ')[1]
	const decoded = jwt.verify(token, process.env.JWT_SECRET)
	const userOrders = await Order.find({ client: decoded.id }).limit(10)
	if (userOrders) {
		res.status(200).json({
			userOrders,
		})
	} else {
		res.status(404).json({
			message: "Nous n'avons trouvé aucune commande à votre nom...",
		})
	}
}

// @desc    Get orders
// @route   Get /api/orders
// @access  Private + admin
const getAllOrders = async (req, res) => {
	const allOrders = await Order.find({})

	// TODO : Implement pagination

	if (allOrders) {
		res.status(200).json({
			allOrders,
		})
	} else {
		res.status(404).json({ message: 'Aucune commande trouvée' })
	}
}

// @desc    Get orders
// @route   Get /api/orders
// @access  Private + admin
const getAllOrdersBySession = async (req, res) => {
	const sessionOrders = await Order.find({ session: req.query.session })

	if (sessionOrders) {
		res.status(200).json({
			sessionOrders,
		})
	} else {
		res.status(404).json({ message: 'Aucune commande trouvée' })
	}
}

// @desc    Update Order details
// @route   PUT /api/orders
// @access  Private
const updateOrder = async (req, res) => {
	const order = await Order.findById(req.body.order._id)

	if (order) {
		order.details = req.body.order.details || order.details
		const updatedOrder = await order.save()
		res.status(200).json({
			_id: updatedOrder._id,
			client: updatedOrder.client,
			details: updatedOrder.details,
			amap: updatedOrder.amap,
			session: updatedOrder.session,
		})
	} else {
		res.status(404).json({ message: 'Commande introuvable...' })
	}
}

// @desc    Delete Order
// @route   DELETE /api/orders
// @access  Private + Admin
const deleteOrder = async (req, res) => {
	const order = await Order.findById(req.query.id)
	if (order) {
		order.remove()
		res.json({ message: 'Order deleted' })
	} else {
		res.status(404).json({ message: 'Commande introuvable...' })
	}
}

export {
	newOrder,
	getSingleOrder,
	getAllOrders,
	getAllOrdersBySession,
	getMyOrders,
	updateOrder,
	deleteOrder,
}
