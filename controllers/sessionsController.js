import Session from '@/models/sessionModel'

import dbConnect from '@/lib/dbConnect.js'

dbConnect()

// @desc    Add a new session
// @route   POST /api/sessions
// @access  Private + admin
const addNewSession = async (req, res) => {
	const { session, isOpen } = req.body
	const sessionExists = await Session.findOne({ session })

	if (sessionExists) {
		res.status(400).json({
			mesage: `Cette session existe déjà...\nMettez la à jour -> ${sessionExists._id} ?`,
		})
	} else {
		const newSession = await Session.create({
			session,
			isOpen,
		})

		if (newSession) {
			res.status(201).json({
				_id: newSession._id,
				session: newSession.session,
				isOpen: newSession.isOpen,
				receptionDate: newSession.receptionDate,
			})
		} else {
			res.status(400).json({ message: 'Données de session éronnées.' })
		}
	}
}

// @desc    Get session by session
// @route   Get /api/sessions
// @access  Private
const getSessions = async (req, res) => {
	if (req.query.id) {
		const session = await Session.findById(req.query.id)

		if (session) {
			res.status(200).json({
				_id: session._id,
				session: session.session,
				isOpen: session.isOpen,
				receptionDate: session.receptionDate,
			})
		} else {
			res.status(400).json({ message: 'Session introuvable...' })
		}
	} else if (req.query.session) {
		const session = parseInt(req.query.session)
		const foundSession = await Session.find({ session })

		if (foundSession.length > 0) {
			res.status(200).json({
				_id: foundSession[0]._id,
				session: foundSession[0].session,
				isOpen: foundSession[0].isOpen,
				receptionDate: foundSession[0].receptionDate,
			})
		} else {
			res.status(200).json([])
		}
	} else {
		const sessions = await Session.find()

		if (sessions) {
			res.status(200).json({
				sessions,
			})
		} else {
			res.status(400).json({ message: 'Aucune session trouvée...' })
		}
	}
}

export { addNewSession, getSessions }
