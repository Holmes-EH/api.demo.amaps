import User from '@/models/userModel.js'
import generateToken from '../utils/generateToken.js'

import dbConnect from '@/lib/dbConnect.js'

dbConnect()

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
	const { name, email, isAdmin, password } = req.body

	const userExists = await User.findOne({ email })

	if (userExists) {
		res.status(400).json({ error: 'User already exists' })
	} else {
		const user = await User.create({
			name,
			email,
			isAdmin,
			password,
		})

		if (user) {
			res.status(201).json({
				_id: user._id,
				name: user.name,
				email: user.email,
				isAdmin: user.isAdmin,
				token: generateToken(user._id),
			})
		} else {
			res.status(400).json({ error: 'Invalid user data' })
		}
	}
}

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
	const { email, password } = req.body

	const user = await User.findOne({ email })

	if (user && (await user.matchPassword(password))) {
		res.json({
			_id: user._id,
			name: user.name,
			email: user.email,
			isAdmin: user.isAdmin,
			token: generateToken(user._id),
		})
	} else {
		res.status(401).json({ message: 'Invalid email or password' })
	}
}

// TODO: Update and maybe delete ?

export { registerUser, authUser }
