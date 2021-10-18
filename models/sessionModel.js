import mongoose from 'mongoose'

const sessionSchema = mongoose.Schema(
	{
		session: {
			type: Number,
			unique: true,
			required: true,
		},
		receptionDate: {
			type: Date,
		},
		isOpen: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	}
)

module.exports =
	mongoose.models.Session || mongoose.model('Session', sessionSchema)
