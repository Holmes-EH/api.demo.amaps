import mongoose from 'mongoose'

const orderSchema = mongoose.Schema(
	{
		client: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},
		details: [
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
		deliveryDate: {
			type: Date,
		},
		amap: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Amap',
			required: true,
		},
		paid: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	}
)

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema)
