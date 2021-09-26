import mongoose from 'mongoose'

const amapSchema = mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		contact: {
			emails: [
				{ email: { type: String, required: false, unique: true } },
			],
			tel: {
				type: String,
				required: false,
				unique: false,
			},
			address: {
				street: { type: String, required: false },
				city: { type: String, required: false },
				postalCode: { type: String, required: false },
			},
		},
		accessCode: {
			type: String,
			required: false,
			unique: true,
		},
	},
	{
		timestamps: true,
	}
)

module.exports = mongoose.models.Amap || mongoose.model('Amap', amapSchema)
