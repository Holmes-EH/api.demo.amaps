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
		session: {
			type: Number,
			required: true,
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

orderSchema.pre('save', function () {
	this.details = this.details.sort((a, b) =>
		a.title > b.title ? 1 : b.title > a.title ? -1 : 0
	)
})

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema)
