import { getRecapsBySession } from '@/controllers/orderController'
import nc from 'next-connect'
import allowCors from '@/utils/allowCors'
import { protect, admin } from '@/middleware/authMiddleware'

const handler = nc({ attachParams: true })

handler.get(protect, admin, async (req, res) => {
	await getRecapsBySession(req, res)
})

export default allowCors(handler)
