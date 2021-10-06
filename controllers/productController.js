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
		res.status(400).json({ message: 'Ce produit existe déjà' })
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
			res.status(400).json({ message: 'Données produit erronés' })
		}
	}
}

// @desc    Get products
// @route   Get /api/products
// @access  Public
const getAllProducts = async (req, res) => {
	const products = await Product.find({}).sort('title')

	if (products) {
		res.status(200).json(products)
	} else {
		res.status(400).json({ message: 'Aucun produit trouvé' })
	}
}

// @desc    Get products
// @route   Get /api/products/id
// @access  Public
const getProduct = async (req, res) => {
	const product = await Product.findById(req.query.id)
	if (product) {
		res.status(200).json({
			_id: product._id,
			title: product.title,
			pricePerKg: product.pricePerKg,
			isAvailable: product.isAvailable,
		})
	} else {
		res.status(400).json({
			message: "Ce produit n'est pas dans la base de données...",
		})
	}
}

// @desc    Update Product details
// @route   PUT /api/products
// @access  Private
const updateProduct = async (req, res) => {
	const product = await Product.findById(req.body.id)

	if (product) {
		product.title = req.body.title || product.title
		product.pricePerKg = req.body.pricePerKg || product.pricePerKg
		product.isAvailable = req.body.isAvailable ? true : false

		const updatedProduct = await product.save()
		res.json({
			_id: updatedProduct._id,
			title: updatedProduct.title,
			pricePerKg: updatedProduct.pricePerKg,
			isAvailable: updatedProduct.isAvailable,
		})
	} else {
		res.status(404).json({
			message: "Ce produit n'est pas dans la base de données...",
		})
	}
}

// @desc    Delete Product
// @route   DELETE /api/products/id
// @access  Private + Admin
const deleteProduct = async (req, res) => {
	const product = await Product.findById(req.query.id)

	if (product) {
		product.remove()
		res.json({ message: 'Produit supprimé avec succès' })
	} else {
		res.status(404).json({
			message: "Ce produit n'est pas dans la base de données...",
		})
	}
}

export {
	registerProduct,
	getProduct,
	getAllProducts,
	updateProduct,
	deleteProduct,
}
