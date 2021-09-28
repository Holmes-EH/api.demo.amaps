import User from '@/models/userModel.js'
import generateToken from '../utils/generateToken.js'
import jwt from 'jsonwebtoken'

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

// @desc    Get user Profile
// @route   Get /api/users
// @access  Private
const getUser = async (req, res) => {
	const token = req.headers.authorization.split(' ')[1]
	var decoded = jwt.verify(token, process.env.JWT_SECRET)
	const user = await User.findById(decoded.id)

	if (user) {
		res.json({
			_id: user._id,
			name: user.name,
			email: user.email,
			isAdmin: user.isAdmin,
			lastUpdated: user.updatedAt,
		})
	} else {
		res.status(404).json({ message: 'User not found' })
	}
}

// @desc    Get all user Profiles
// @route   Get /api/users/all
// @access  Private + admin
const getAllUsers = async (req, res) => {
	const users = await User.find({}).select('-password')
	if (users) {
		res.json(users)
	} else {
		res.status(404).json({ message: 'No users Found' })
	}
}

// @desc    Update User details
// @route   PUT /api/users
// @access  Private
const updateUser = async (req, res) => {
	const user = await User.findById(req.body._id)

	// TODO: Maybe check if id in token is of same user  user.isAdmin

	if (user) {
		user.name = req.body.name || user.name
		user.email = req.body.email || user.email
		user.isAdmin = req.body.isAdmin || user.isAdmin
		if (req.body.password) {
			user.password = req.body.password
		}

		const updatedUser = await user.save()
		res.json({
			_id: updatedUser._id,
			name: updatedUser.name,
			email: updatedUser.email,
			isAdmin: updatedUser.isAdmin,
			token: generateToken(updatedUser._id),
		})
	} else {
		res.status(404).json({ message: 'User not found' })
	}
}

// @desc    Delete User
// @route   DELETE /api/users
// @access  Private + Admin
const deleteUser = async (req, res) => {
	const user = await User.findById(req.body._id)

	if (user) {
		user.remove()
		res.json({ message: 'User deleted' })
	} else {
		res.status(404).json({ message: 'User not found' })
	}
}

export { registerUser, authUser, getUser, getAllUsers, updateUser, deleteUser }
