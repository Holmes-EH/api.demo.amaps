import {
	registerUser,
	getAllUsers,
	updateUser,
} from '@/controllers/userController'
import dbConnect from '@/lib/dbConnect'
import nc from 'next-connect'
import allowCors from '@/utils/allowCors'
import { protect, admin } from '@/middleware/authMiddleware'

dbConnect()

const handler = nc({ attachParams: true })

handler
	.post(async (req, res) => {
		await registerUser(req, res)
	})
	.get(protect, admin, async (req, res) => {
		await getAllUsers(req, res)
	})
	.put(protect, async (req, res) => {
		await updateUser(req, res)
	})

export default allowCors(handler)
