import mongoose from 'mongoose'

const passwordResetSchema = mongoose.Schema(
	{
		shortLivedToken: {
			type: String,
			required: true,
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
	},
	{
		timestamps: true,
	}
)

module.exports =
	mongoose.models.PasswordReset ||
	mongoose.model('PasswordReset', passwordResetSchema)
