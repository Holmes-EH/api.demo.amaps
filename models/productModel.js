import mongoose from 'mongoose'

const productSchema = mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	pricePerKg: {
		type: Number,
		required: true,
	},
	isAvailable: {
		type: Boolean,
		default: true,
	},
})

module.exports =
	mongoose.models.Product || mongoose.model('Product', productSchema)
