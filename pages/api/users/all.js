import { getAllUsers } from '@/controllers/userController'
import dbConnect from '@/lib/dbConnect'
import nc from 'next-connect'
import allowCors from '@/utils/allowCors'
import { protect, admin } from '@/middleware/authMiddleware'

dbConnect()

const handler = nc({ attachParams: true })

handler.get(protect, admin, async (req, res) => {
	await getAllUsers(req, res)
})

export default allowCors(handler)
