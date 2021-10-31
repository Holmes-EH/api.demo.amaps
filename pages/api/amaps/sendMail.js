import { sendMailToAmap } from '@/controllers/amapController'
import dbConnect from '@/lib/dbConnect'
import nc from 'next-connect'
import allowCors from '@/utils/allowCors'
import { protect, admin } from '@/middleware/authMiddleware'

dbConnect()

const handler = nc({ attachParams: true })

handler.post(protect, admin, async (req, res) => {
	await sendMailToAmap(req, res)
})

export default allowCors(handler)
