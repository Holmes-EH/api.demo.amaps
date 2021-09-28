import { registerProduct, getProducts } from '@/controllers/productController'
import dbConnect from '@/lib/dbConnect'
import nc from 'next-connect'
import { protect, admin } from '@/middleware/authMiddleware'

dbConnect()

const handler = nc({ attachParams: true })

handler
	.post(protect, admin, async (req, res) => {
		await registerProduct(req, res)
	})
	.get(protect, async (req, res) => {
		await getProducts(req, res)
	})

export default handler
