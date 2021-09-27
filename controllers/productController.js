import Product from '@/models/productModel.js'
import dbConnect from '@/lib/dbConnect.js'

dbConnect()

// @desc    Register a new product
// @route   POST /api/products
// @access  Public
const registerProduct = async (req, res) => {
	const { title, pricePerKg, isAvailable } = req.body

	const productExists = await Product.findOne({ title })

	if (productExists) {
		res.status(400).json({ message: 'Product already exists' })
	} else {
		const product = await Product.create({
			title,
			pricePerKg,
			isAvailable,
		})

		if (product) {
			res.status(201).json({
				_id: product._id,
				title: product.title,
				pricePerKg: product.pricePerKg,
				isAvailable: product.isAvailable,
			})
		} else {
			res.status(400).json({ message: 'Invalid product data' })
		}
	}
}

// @desc    Get products
// @route   Get /api/products
// @access  Public
const getProducts = async (req, res) => {
	if (req.body.product) {
		const product = await Product.findById(req.body.product._id)
		if (product) {
			res.status(200).json({
				_id: product._id,
				title: product.title,
				pricePerKg: product.pricePerKg,
				isAvailable: product.isAvailable,
			})
		} else {
			res.status(400).json({ message: 'Product not found' })
		}
	} else {
		const products = await Product.find({})

		if (products) {
			res.status(200).json(products)
		} else {
			res.status(400).json({ message: 'No Products Found' })
		}
	}
}

// TODO: Update and maybe delete ?

export { registerProduct, getProducts }
