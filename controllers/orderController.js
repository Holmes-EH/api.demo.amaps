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
			message: `Cette commande pour cet utilisateur et ce mois existe déjà...\nMettez la à jour -> ${orderExists._id} ?`,
		})
	} else {
		const orderRecapExists = await OrderRecap.findOne({
			amap,
			session,
		})
		if (orderRecapExists) {
			if (orderRecapExists.totalWeight <= 900) {
				let order = await Order.create({
					client,
					details,
					amap,
					session,
				})

				if (order) {
					orderRecapExists.products.forEach((product) => {
						let detailToUpdate = order.details.filter((detail) =>
							detail.product.equals(product.product)
						)
						if (detailToUpdate.length > 0) {
							product.quantity += detailToUpdate[0].quantity
							orderRecapExists.totalWeight +=
								detailToUpdate[0].quantity
						}
					})

					await orderRecapExists.save()

					order = await order.populate('details.product')

					const emailData = await buildEmailData({
						client: order.client,
						details: order.details,
						amapId: order.amap,
						session: order.session,
					})
					await sendEmail(emailData)
					res.status(201).json({
						_id: order._id,
						client: order.client,
						details: order.details,
						amap: order.amap,
						session: order.session,
					})
				} else {
					res.status(400).json({
						message: 'Données de commande érronés.',
					})
				}
			} else {
				res.status(401).json({
					message:
						'Désolé, nous avons atteint le poids maximum pour cette amap.\nRevenez le mois prochain...',
				})
			}
		} else {
			await OrderRecap.create({
				products: details,
				session,
				amap,
				totalWeight: 0,
			})
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

// @desc    Get users last order
// @route   Get /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
	const limit = req.query.limit || 1
	const token = req.headers.authorization.split(' ')[1]
	const decoded = jwt.verify(token, process.env.JWT_SECRET)
	const userOrders = await Order.find({ client: decoded.id })
		.sort({ session: 'desc' })
		.limit(limit)
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
	const { amap, session, clientName } = req.query

	if (amap || session || clientName) {
		let requestedClient
		if (clientName) {
			const keyword = clientName
				? {
						name: {
							$regex: clientName,
							$options: 'i',
						},
				  }
				: {}
			requestedClient = await User.find({ ...keyword })
		}
		let allOrders
		if (amap && session && !requestedClient) {
			allOrders = await Order.find({ amap, session })
				.populate({
					path: 'client',
					select: ['name'],
					model: User,
				})
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
		} else if (amap && session && requestedClient) {
			allOrders = await Order.find({
				amap,
				session,
				client: requestedClient,
			})
				.populate({
					path: 'client',
					select: ['name'],
					model: User,
				})
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
		} else if (amap && requestedClient && !session) {
			allOrders = await Order.find({ amap, requestedClient })
				.populate({
					path: 'client',
					select: ['name'],
					model: User,
				})
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
		} else if (amap && !requestedClient && !session) {
			allOrders = await Order.find({ amap })
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
		} else if (session && requestedClient && !amap) {
			allOrders = await Order.find({
				session,
				client: requestedClient,
			})
				.populate({
					path: 'client',
					select: ['name'],
					model: User,
				})
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
		} else if (session && !requestedClient && !amap) {
			allOrders = await Order.find({ session })
				.populate({
					path: 'client',
					select: ['name'],
					model: User,
				})
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
		} else if (requestedClient && !session && !amap) {
			allOrders = await Order.find({ client: requestedClient })
				.populate({
					path: 'client',
					select: ['name'],
					model: User,
				})
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
		}

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
			if (orderRecapExists.totalWeight <= 900) {
				// Remove previous order details from order recap
				orderRecapExists.products.map((product) => {
					let detailToUpdate = order.details.filter((detail) =>
						detail.product._id.equals(product.product)
					)
					if (detailToUpdate.length > 0) {
						product.quantity -= detailToUpdate[0].quantity
						orderRecapExists.totalWeight -=
							detailToUpdate[0].quantity
						if (product.quantity < 0) {
							product.quantity = 0
						}
						if (orderRecapExists.totalWeight < 0) {
							orderRecapExists.totalWeight = 0
						}
					}
				})
				order.paid = req.body.order.paid ? true : false
				order.details = req.body.order.details || order.details
				const newOrder = await order.save()
				const updatedOrder = await Order.findById(newOrder._id)
					.populate({
						path: 'details',
						populate: {
							path: 'product',
							select: ['_id', 'title', 'pricePerKg', 'unitOnly'],
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

				let productList = []
				orderRecapExists.products.map((product) => {
					productList.push(product.product.toString())
					let detailToUpdate = updatedOrder.details.filter((detail) =>
						detail.product._id.equals(product.product)
					)
					if (detailToUpdate.length > 0) {
						product.quantity += detailToUpdate[0].quantity
						orderRecapExists.totalWeight +=
							detailToUpdate[0].quantity
					}
				})
				updatedOrder.details.map((detail) => {
					if (!productList.includes(detail.product._id.toString())) {
						orderRecapExists.products.push(detail)
					}
				})

				await orderRecapExists.save()

				const emailData = await buildEmailData({
					client: updatedOrder.client,
					details: updatedOrder.details,
					amapId: updatedOrder.amap,
					session: updatedOrder.session,
				})
				await sendEmail(emailData)

				res.status(200).json({
					_id: updatedOrder._id,
					client: updatedOrder.client,
					details: updatedOrder.details,
					amap: updatedOrder.amap,
					session: updatedOrder.session,
					paid: updatedOrder.paid,
				})
			} else {
				res.status(401).json({
					message:
						'Désolé, nous avons atteint le poids maximum pour cette amap.\nRevenez le mois prochain...',
				})
			}
		}
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
		// First subtract old order from recap
		const orderRecapExists = await OrderRecap.findOne({
			amap: order.amap,
			session: order.session,
		})
		if (orderRecapExists) {
			orderRecapExists.products.map((product) => {
				let detailToUpdate = order.details.filter((detail) =>
					detail.product.equals(product.product)
				)
				if (detailToUpdate.length > 0) {
					product.quantity -= detailToUpdate[0].quantity
					if (product.quantity < 0) {
						product.quantity = 0
					}
				}
			})
		}
		await orderRecapExists.save()
		await order.remove()
		res.json({ message: 'Commande supprimée' })
	} else {
		res.status(404).json({ message: 'Commande introuvable...' })
	}
}

// @desc    Get all orders by session
// @route   Get /api/orders/recaps?session
// @access  Private + admin
const getRecapsBySession = async (req, res) => {
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
			select: [
				'name',
				'groupement',
				'deliveryDay',
				'accessCode',
				'deliveryTime',
			],
			model: Amap,
		})
		.sort({ amap: 'asc' })
	if (sessionRecaps) {
		res.status(200).json({
			sessionRecaps,
		})
	} else {
		res.status(404).json({ message: 'Aucun récapitulatif trouvé' })
	}
}

// @desc    Get next delivery date per recap + amap
// @route   Get /api/orders/recaps/nextdelivery
// @access  Private
const getNextDelivery = async (req, res) => {
	const { session, amap } = req.query
	if (session === 'undefined') {
		return
	}
	const recapDelivery = await OrderRecap.findOne({
		session,
		amap,
	}).select('delivery')
	if (recapDelivery) {
		res.status(200).json(recapDelivery)
	} else {
		res.status(404).json({ message: 'Aucun récapitulatif trouvé..' })
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
	getNextDelivery,
}
