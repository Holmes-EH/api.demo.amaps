import { checkAmapCode } from '@/controllers/amapController'
import dbConnect from '@/lib/dbConnect'
import nc from 'next-connect'
import allowCors from '@/utils/allowCors'

dbConnect()

const handler = nc({ attachParams: true })

handler.post(async (req, res) => {
	await checkAmapCode(req, res)
})

export default allowCors(handler)
