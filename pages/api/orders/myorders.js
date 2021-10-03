import { getMyOrders } from '@/controllers/orderController'
import nc from 'next-connect'
import allowCors from '@/utils/allowCors'
import { protect } from '@/middleware/authMiddleware'

const handler = nc({ attachParams: true })

handler.get(protect, async (req, res) => {
	await getMyOrders(req, res)
})

export default allowCors(handler)
