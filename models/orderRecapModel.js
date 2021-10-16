import mongoose from 'mongoose'

const orderRecapSchema = mongoose.Schema({
	products: [
		{
			product: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Product',
				required: true,
			},
			quantity: {
				type: Number,
			},
		},
	],
	session: {
		type: Number,
		required: true,
	},
	amap: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Amap',
		required: true,
	},
})

module.exports =
	mongoose.models.OrderRecap || mongoose.model('OrderRecap', orderRecapSchema)