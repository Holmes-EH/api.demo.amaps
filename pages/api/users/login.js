import { authUser } from '@/controllers/userController'
import dbConnect from '@/lib/dbConnect'
import nc from 'next-connect'
import allowCors from '@/utils/allowCors'

dbConnect()

const handler = nc({ attachParams: true })

handler.post(async (req, res) => {
	await authUser(req, res)
})

export default allowCors(handler)
