import {
	registerProduct,
	getProducts,
	updateProduct,
	deleteProduct,
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
		await getProducts(req, res)
	})
	.put(protect, admin, async (req, res) => {
		await updateProduct(req, res)
	})
	.delete(protect, admin, async (req, res) => {
		await deleteProduct(req, res)
	})

export default allowCors(handler)
