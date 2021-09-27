import { registerProduct, getProducts } from '@/controllers/productController'
import dbConnect from '@/lib/dbConnect'
import nc from 'next-connect'
import protect from '@/middleware/authMiddleware'

dbConnect()

const handler = nc({ attachParams: true })

handler
	.post(protect, async (req, res) => {
		await registerProduct(req, res)
	})
	.get(async (req, res) => {
		await getProducts(req, res)
	})

export default handler
