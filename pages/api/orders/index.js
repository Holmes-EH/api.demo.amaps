import {
	deleteOrder,
	getOrders,
	newOrder,
	updateOrder,
} from '@/controllers/orderController'
import nc from 'next-connect'
import allowCors from '@/utils/allowCors'
import { protect, admin } from '@/middleware/authMiddleware'

const handler = nc({ attachParams: true })

handler
	.post(protect, async (req, res) => {
		await newOrder(req, res)
	})
	.get(protect, async (req, res) => {
		await getOrders(req, res)
	})
	.put(protect, async (req, res) => {
		await updateOrder(req, res)
	})
	.delete(protect, admin, async (req, res) => {
		await deleteOrder(req, res)
	})

export default allowCors(handler)
