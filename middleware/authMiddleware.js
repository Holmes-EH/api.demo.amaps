import jwt from 'jsonwebtoken'
import User from '@/models/userModel'

import dbConnect from '@/lib/dbConnect.js'

dbConnect()

const protect = async (req, res, next) => {
	let token
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		try {
			token = req.headers.authorization.split(' ')[1]

			jwt.verify(token, process.env.JWT_SECRET)

			next()
		} catch (error) {
			res.status(401).json({ error: 'Not authorized, token failed' })
		}
	}

	if (!token) {
		res.status(401).json({ error: 'Not Authorized, no token' })
	}
}

const admin = async (req, res, next) => {
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		let token = req.headers.authorization.split(' ')[1]

		var decoded = jwt.verify(token, process.env.JWT_SECRET)
		var userId = decoded.id
		const user = await User.findById(userId)

		if (user.isAdmin) {
			next()
		} else {
			res.status(401).json({ message: 'Not authorized - Only admin' })
		}
	} else {
		res.status(401).json({
			message: `Not authorized - Must be logged in \n ${err}`,
		})
	}
}

export { protect, admin }
