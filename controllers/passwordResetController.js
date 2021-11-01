import PasswordReset from '@/models/passwordResetModel.js'
import User from '@/models/userModel.js'
import generateToken from '../utils/generateToken.js'

import dbConnect from '@/lib/dbConnect.js'

dbConnect()

// @desc    Reset a users password
// @route   POST /api/recovery/password
// @access  Public

const getShortToken = async (req, res) => {
	const { email, amap } = req.body

	const userExists = await User.findOne({ email, amap })

	if (!userExists) {
		res.status(404).json({
			message:
				"Nous n'avons pas trouvé d'utilisateur avec cette adresse email...",
		})
	} else {
		const resetPasswordEntry = await PasswordReset.create({
			shortLivedToken: generateToken(userExists._id, '120s'),
			user: userExists._id,
		})
		if (resetPasswordEntry) {
			res.status(201).json({
				_id: userExists._id,
				name: userExists.name,
				email: userExists.email,
				shortLivedToken: resetPasswordEntry.shortLivedToken,
			})
		}
	}
}

export { getShortToken }
