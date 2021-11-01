import User from '@/models/userModel.js'
import Order from '@/models/orderModel.js'
import Amap from '@/models/amapModel.js'
import generateToken from '../utils/generateToken.js'
import jwt from 'jsonwebtoken'

import dbConnect from '@/lib/dbConnect.js'

dbConnect()

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
	const { name, email, amap, password } = req.body
	const isAdmin = req.body.isAdmin || false

	const userExists = await User.findOne({ email })

	if (userExists) {
		res.status(400).json({ message: 'Cet ulitilisateur existe déjà' })
	} else {
		const user = await User.create({
			name,
			email,
			amap,
			isAdmin,
			password,
		})

		if (user) {
			res.status(201).json({
				_id: user._id,
				name: user.name,
				email: user.email,
				amap: user.amap,
				isAdmin: user.isAdmin,
				token: generateToken(user._id),
			})
		} else {
			res.status(400).json({ message: 'Données utilisateur erronés' })
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
			amap: user.amap,
			token: generateToken(user._id),
		})
	} else {
		res.status(401).json({ message: 'Email ou mot de passe erroné' })
	}
}

// @desc    Get user Profile
// @route   Get /api/users/id
// @access  Private
const getUser = async (req, res) => {
	const user = await User.findById(req.query.id)

	if (user) {
		res.status(200).json({
			_id: user._id,
			name: user.name,
			email: user.email,
			amap: user.amap,
			isAdmin: user.isAdmin,
			lastUpdated: user.updatedAt,
		})
	} else {
		res.status(404).json({ message: 'Utilisateur introuvable' })
	}
}

// @desc    Get all user Profiles
// @route   Get /api/users/all(?keyword)
// @access  Private + admin
const getAllUsers = async (req, res) => {
	const pageSize = 10
	const page = Number(req.query.pageNumber) || 1
	const keyword = req.query.keyword
		? {
				name: {
					$regex: req.query.keyword,
					$options: 'i',
				},
		  }
		: {}

	const count = await User.countDocuments({ ...keyword })
	const users = await User.find({ ...keyword })
		.select('-password')
		.sort({ name: 'asc' })
		.populate({ path: 'amap', select: ['name', 'groupement'], model: Amap })
		.limit(pageSize)
		.skip(pageSize * (page - 1))
	if (users) {
		res.json({ users, page, pages: Math.ceil(count / pageSize) })
	} else {
		res.status(404).json({ message: 'Aucun utilisateur trouvé' })
	}
}

// @desc    Update User details
// @route   PUT /api/users
// @access  Private
const updateUser = async (req, res) => {
	const user = await User.findById(req.body._id)

	const token = req.headers.authorization.split(' ')[1]

	var decoded = jwt.verify(token, process.env.JWT_SECRET)
	var userId = decoded.id
	const userRequesting = await User.findById(userId)

	if (user) {
		user.name = req.body.name || user.name
		user.email = req.body.email || user.email

		if (userRequesting.isAdmin && !user._id.equals(userRequesting._id)) {
			user.isAdmin = req.body.isAdmin ? true : false
		} else if (
			userRequesting.isAdmin &&
			user._id.equals(userRequesting._id)
		) {
			user.isAdmin = true
		}
		user.amap = req.body.amap || user.amap
		if (req.body.password) {
			user.password = req.body.password
		}

		const updatedUser = await user.save()
		res.json({
			_id: updatedUser._id,
			name: updatedUser.name,
			email: updatedUser.email,
			amap: updatedUser.amap,
			isAdmin: updatedUser.isAdmin,
			token,
		})
	} else {
		res.status(404).json({ message: 'Utilisateur introuvable' })
	}
}

// @desc    Delete User
// @route   DELETE /api/users
// @access  Private + Admin
const deleteUser = async (req, res) => {
	const user = await User.findById(req.query.id)
	await Order.find({ client: req.query.id }).then((results) => {
		return results.map(async (order) => {
			return await order.remove()
		})
	})
	if (user) {
		user.remove()
		res.json({ message: 'Utilisateur supprimé' })
	} else {
		res.status(404).json({ message: 'Utilisateur introuvable' })
	}
}

export { registerUser, authUser, getUser, getAllUsers, updateUser, deleteUser }
