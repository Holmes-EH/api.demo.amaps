import { registerAmap, getAmapdetails } from '@/controllers/amapController'
import dbConnect from '@/lib/dbConnect'
import nc from 'next-connect'
import protect from '@/middleware/authMiddleware'

dbConnect()

const handler = nc({ attachParams: true })

handler
	.post(protect, async (req, res) => {
		await registerAmap(req, res)
	})
	.get(protect, async (req, res) => {
		await getAmapdetails(req, res)
	})

export default handler
