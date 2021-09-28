import jwt from 'jsonwebtoken'

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
			console.error(error)
			res.status(401).json({ error: 'Not authorized, token failed' })
		}
	}

	if (!token) {
		res.status(401).json({ error: 'Not Authorized, no token' })
	}
}

const admin = (req, res, next) => {
	if (req.body.user && req.body.user.isAdmin) {
		next()
	} else {
		res.status(401).json({ message: 'Not authorized - Only admin' })
	}
}

export { protect, admin }
