import { getNextDelivery } from '@/controllers/orderController'
import nc from 'next-connect'
import allowCors from '@/utils/allowCors'
import { protect } from '@/middleware/authMiddleware'

const handler = nc({ attachParams: true })

handler.get(protect, async (req, res) => {
	await getNextDelivery(req, res)
})

export default allowCors(handler)
