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
	totalWeight: {
		type: Number,
	},
	amap: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Amap',
		required: true,
	},
	delivery: {
		type: Date,
	},
	notificationSent: {
		type: Boolean,
		default: false,
	},
})

module.exports =
	mongoose.models.OrderRecap || mongoose.model('OrderRecap', orderRecapSchema)
