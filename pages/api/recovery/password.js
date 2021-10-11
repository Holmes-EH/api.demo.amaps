import { getShortToken } from '@/controllers/passwordResetController'
import dbConnect from '@/lib/dbConnect'
import nc from 'next-connect'
import allowCors from '@/utils/allowCors'

dbConnect()

const handler = nc({ attachParams: true })

handler.post(async (req, res) => {
	await getShortToken(req, res)
})

export default allowCors(handler)
