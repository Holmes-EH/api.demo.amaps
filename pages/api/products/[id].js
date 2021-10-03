import { getProduct, deleteProduct } from '@/controllers/productController'
import dbConnect from '@/lib/dbConnect'
import nc from 'next-connect'
import allowCors from '@/utils/allowCors'
import { protect, admin } from '@/middleware/authMiddleware'

dbConnect()

const handler = nc({ attachParams: true })

handler
	.get(protect, async (req, res) => {
		await getProduct(req, res)
	})
	.delete(protect, admin, async (req, res) => {
		await deleteProduct(req, res)
	})

export default allowCors(handler)
