import {
	registerAmap,
	getAllAmaps,
	updateAmap,
} from '@/controllers/amapController'
import dbConnect from '@/lib/dbConnect'
import nc from 'next-connect'
import allowCors from '@/utils/allowCors'
import { protect, admin } from '@/middleware/authMiddleware'

dbConnect()

const handler = nc({ attachParams: true })

handler
	.post(protect, admin, async (req, res) => {
		await registerAmap(req, res)
	})
	.get(protect, async (req, res) => {
		await getAllAmaps(req, res)
	})
	.put(protect, admin, async (req, res) => {
		await updateAmap(req, res)
	})

export default allowCors(handler)
