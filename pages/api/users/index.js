import {
	registerUser,
	getUser,
	updateUser,
	deleteUser,
} from '@/controllers/userController'
import dbConnect from '@/lib/dbConnect'
import nc from 'next-connect'
import { protect, admin } from '@/middleware/authMiddleware'

dbConnect()

const handler = nc({ attachParams: true })

handler
	.post(async (req, res) => {
		await registerUser(req, res)
	})
	.get(protect, async (req, res) => {
		await getUser(req, res)
	})
	.put(protect, async (req, res) => {
		await updateUser(req, res)
	})
	.delete(protect, admin, async (req, res) => await deleteUser(req, res))

export default handler
