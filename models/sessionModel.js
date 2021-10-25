import mongoose from 'mongoose'

const sessionSchema = mongoose.Schema(
	{
		session: {
			type: Number,
			unique: true,
			required: true,
		},
		lastOrderDate: {
			type: Date,
		},
		isOpen: {
			type: Boolean,
			default: false,
		},
		news: {
			type: String,
			default: '',
		},
	},
	{
		timestamps: true,
	}
)

module.exports =
	mongoose.models.Session || mongoose.model('Session', sessionSchema)
