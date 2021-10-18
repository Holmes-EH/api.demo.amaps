import Order from '@/models/orderModel'
import Product from '@/models/productModel'
import Amap from '@/models/amapModel'
import User from '@/models/userModel'
import OrderRecap from '@/models/orderRecapModel'
import jwt from 'jsonwebtoken'
import { buildEmailData, sendEmail } from '@/lib/sendmail'

import dbConnect from '@/lib/dbConnect.js'

dbConnect()

// @desc    Add a new order
// @route   POST /api/orders
// @access  Private
const newOrder = async (req, res) => {
	const { client, details, amap, session } = req.body
	const orderExists = await Order.findOne({ client, session })

	if (orderExists) {
		res.status(400).json({
			mesage: `Cette commande pour cet utilisateur et ce mois existe déjà...\nMettez la à jour -> ${orderExists._id} ?`,
		})
	} else {
		let order = await Order.create({
			client,
			details,
			amap,
			session,
		})

		if (order) {
			const orderRecapExists = await OrderRecap.findOne({ amap, session })
			if (orderRecapExists) {
				let productList = []
				orderRecapExists.products.map((product) => {
					productList.push(product.product.toString())
					let detailToUpdate = order.details.filter((detail) =>
						detail.product.equals(product.product)
					)
					if (detailToUpdate.length > 0) {
						product.quantity += detailToUpdate[0].quantity
					} else {
						order.details.map((detail) => {
							if (
								!productList.includes(detail.product.toString())
							) {
								orderRecapExists.products.push(detail)
							}
						})
					}
				})

				await orderRecapExists.save()
			} else {
				await OrderRecap.create({
					products: details,
					session,
					amap,
				})
			}
			order = await order.populate('details.product')

			const emailData = await buildEmailData({
				client: order.client,
				details: order.details,
				amap: order.amap,
				session: order.session,
			})
			sendEmail(emailData)
			res.status(201).json({
				_id: order._id,
				client: order.client,
				details: order.details,
				amap: order.amap,
				session: order.session,
			})
		} else {
			res.status(400).json({ message: 'Données de commande érronés.' })
		}
	}
}

// @desc    Get order by id
// @route   Get /api/orders/id
// @access  Private
const getSingleOrder = async (req, res) => {
	const order = await Order.findById(req.query.id)
		.populate({
			path: 'details',
			populate: {
				path: 'product',
				select: ['title', 'pricePerKg'],
				model: Product,
			},
		})
		.populate({ path: 'amap', select: ['name', 'groupement'], model: Amap })

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

// @desc    Get users last 10 orders
// @route   Get /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
	const token = req.headers.authorization.split(' ')[1]
	const decoded = jwt.verify(token, process.env.JWT_SECRET)
	const userOrders = await Order.find({ client: decoded.id })
		.limit(10)
		.populate({
			path: 'details',
			populate: {
				path: 'product',
				select: ['title', 'pricePerKg'],
				model: Product,
			},
		})
		.populate({ path: 'amap', select: ['name', 'groupement'], model: Amap })

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

// @desc    Get all orders
// @route   Get /api/orders
// @access  Private + admin
const getAllOrders = async (req, res) => {
	const amap = req.query.amap

	// TODO : Implement pagination

	if (amap) {
		const allOrders = await Order.find({ amap })
			.populate({
				path: 'details',
				populate: {
					path: 'product',
					select: ['title', 'pricePerKg'],
					model: Product,
				},
			})
			.populate({
				path: 'amap',
				select: ['name', 'groupement'],
				model: Amap,
			})
			.sort({ session: 'asc' })
		if (allOrders) {
			res.status(200).json({
				allOrders,
			})
		} else {
			res.status(404).json({ message: 'Aucune commande trouvée' })
		}
	} else {
		const allOrders = await Order.find()
			.populate({
				path: 'details',
				populate: {
					path: 'product',
					select: ['title', 'pricePerKg'],
					model: Product,
				},
			})
			.populate({
				path: 'amap',
				select: ['name', 'groupement'],
				model: Amap,
			})
			.sort({ amap: 'asc' })
		if (allOrders) {
			res.status(200).json({
				allOrders,
			})
		} else {
			res.status(404).json({ message: 'Aucune commande trouvée' })
		}
	}
}

// @desc    Get all orders by session
// @route   Get /api/orders/session
// @access  Private + admin
const getAllOrdersBySession = async (req, res) => {
	const sessionOrders = await Order.find({
		session: req.query.session,
	})
		.populate({
			path: 'details',
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
		.populate({ path: 'client', select: ['name'] })
		.sort({ amap: 'asc' })

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
		// First subtract old order from recap
		const orderRecapExists = await OrderRecap.findOne({
			amap: order.amap,
			session: order.session,
		})
		if (orderRecapExists) {
			orderRecapExists.products.map((product) => {
				let detailToUpdate = order.details.filter((detail) =>
					detail.product._id.equals(product.product)
				)
				if (detailToUpdate.length > 0) {
					product.quantity -= detailToUpdate[0].quantity
				}
			})
		}

		order.paid = req.body.order.paid ? true : false
		order.details = req.body.order.details || order.details
		const newOrder = await order.save()
		const updatedOrder = await Order.findById(newOrder._id)
			.populate({
				path: 'details',
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
			.populate({ path: 'client', select: ['name'], model: User })

		// Now add updated order details to recap
		if (orderRecapExists) {
			let productList = []
			orderRecapExists.products.map((product) => {
				productList.push(product.product.toString())
				let detailToUpdate = updatedOrder.details.filter((detail) =>
					detail.product._id.equals(product.product)
				)
				if (detailToUpdate.length > 0) {
					product.quantity += detailToUpdate[0].quantity
				}
			})
			updatedOrder.details.map((detail) => {
				if (!productList.includes(detail.product._id.toString())) {
					orderRecapExists.products.push(detail)
				}
			})

			await orderRecapExists.save()
		}

		res.status(200).json({
			_id: updatedOrder._id,
			client: updatedOrder.client,
			details: updatedOrder.details,
			amap: updatedOrder.amap,
			session: updatedOrder.session,
			paid: updatedOrder.paid,
		})
	} else {
		res.status(404).json({ message: 'Commande introuvable...' })
	}
}

// @desc    Delete Order
// @route   DELETE /api/orders/id
// @access  Private + Admin
const deleteOrder = async (req, res) => {
	const order = await Order.findById(req.query.id)
	if (order) {
		order.remove()
		res.json({ message: 'Commande supprimée' })
	} else {
		res.status(404).json({ message: 'Commande introuvable...' })
	}
}

// @desc    Get all orders by session
// @route   Get /api/recaps?session
// @access  Private + admin
const getRecapsBySession = async (req, res) => {
	const pageSize = 10
	const page = Number(req.query.pageNumber) || 1

	const count = await OrderRecap.countDocuments({
		session: req.query.session,
	})
	const sessionRecaps = await OrderRecap.find({ session: req.query.session })
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
		.sort({ amap: 'asc' })
		.limit(pageSize)
		.skip(pageSize * (page - 1))
	if (sessionRecaps) {
		res.status(200).json({
			sessionRecaps,
			page,
			pages: Math.ceil(count / pageSize),
		})
	} else {
		res.status(404).json({ message: 'Aucun récapitulatif trouvé' })
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
	getRecapsBySession,
}
