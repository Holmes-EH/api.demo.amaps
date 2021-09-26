import { registerUser } from '@/controllers/userController'
import dbConnect from '@/lib/dbConnect'
import nc from 'next-connect'

dbConnect()

const handler = nc({ attachParams: true })

handler.post(async (req, res) => {
	await registerUser(req, res)
})

export default handler
