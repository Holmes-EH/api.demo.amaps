import {
	registerProduct,
	getAllProducts,
	updateProduct,
} from '@/controllers/productController'
import dbConnect from '@/lib/dbConnect'
import nc from 'next-connect'
import allowCors from '@/utils/allowCors'
import { protect, admin } from '@/middleware/authMiddleware'

dbConnect()

const handler = nc({ attachParams: true })

handler
	.post(protect, admin, async (req, res) => {
		await registerProduct(req, res)
	})
	.get(protect, async (req, res) => {
		await getAllProducts(req, res)
	})
	.put(protect, admin, async (req, res) => {
		await updateProduct(req, res)
	})

export default allowCors(handler)
