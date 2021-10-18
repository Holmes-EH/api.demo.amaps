import { addNewSession, getSessions } from '@/controllers/sessionsController'
import nc from 'next-connect'
import allowCors from '@/utils/allowCors'
import { protect, admin } from '@/middleware/authMiddleware'

const handler = nc({ attachParams: true })

handler
	.post(protect, admin, async (req, res) => {
		await addNewSession(req, res)
	})
	.get(protect, async (req, res) => {
		await getSessions(req, res)
	})

export default allowCors(handler)
