import {
	registerAmap,
	getAmapdetails,
	updateAmap,
	deleteAmap,
} from '@/controllers/amapController'
import dbConnect from '@/lib/dbConnect'
import nc from 'next-connect'
import { protect, admin } from '@/middleware/authMiddleware'

dbConnect()

const handler = nc({ attachParams: true })

handler
	.post(protect, admin, async (req, res) => {
		await registerAmap(req, res)
	})
	.get(protect, async (req, res) => {
		await getAmapdetails(req, res)
	})
	.put(protect, admin, async (req, res) => {
		await updateAmap(req, res)
	})
	.delete(protect, admin, async (req, res) => {
		await deleteAmap(req, res)
	})

export default handler
