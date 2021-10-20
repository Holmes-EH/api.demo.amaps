import { updateRecapDeliveryDate } from '@/controllers/orderRecpController'
import nc from 'next-connect'
import allowCors from '@/utils/allowCors'
import { protect, admin } from '@/middleware/authMiddleware'

const handler = nc({ attachParams: true })

handler.put(protect, admin, async (req, res) => {
	await updateRecapDeliveryDate(req, res)
})

export default allowCors(handler)
