import { sendMessage } from '@/controllers/userController'
import dbConnect from '@/lib/dbConnect'
import nc from 'next-connect'
import allowCors from '@/utils/allowCors'
import { protect } from '@/middleware/authMiddleware'

dbConnect()

const handler = nc({ attachParams: true })

handler.post(protect, async (req, res) => {
	await sendMessage(req, res)
})

export default allowCors(handler)
