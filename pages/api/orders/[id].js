import { deleteOrder, getSingleOrder } from '@/controllers/orderController'
import nc from 'next-connect'
import allowCors from '@/utils/allowCors'
import { protect, admin } from '@/middleware/authMiddleware'

const handler = nc({ attachParams: true })

handler
	.get(protect, async (req, res) => {
		await getSingleOrder(req, res)
	})
	.delete(protect, admin, async (req, res) => {
		await deleteOrder(req, res)
	})

export default allowCors(handler)
