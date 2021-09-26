import Amap from '@/models/amapModel'
import dbConnect from '@/lib/dbConnect.js'

dbConnect()

// @desc    Register a new amap
// @route   POST /api/amaps
// @access  Public
const registerAmap = async (req, res) => {
	const { name, contact } = req.body

	const amapExists = await Amap.findOne({ name })

	if (amapExists) {
		res.status(400).json({ message: 'Amap already exists' })
	}

	const amap = await Amap.create({
		name,
		contact,
	})

	if (amap) {
		res.status(201).json({
			_id: amap._id,
			name: amap.name,
			contact: amap.contact,
		})
	} else {
		res.status(400).json({ message: 'Amap not found' })
	}
}

// @desc    Get amap details
// @route   Get /api/amaps
// @access  Public
const getAmapdetails = async (req, res) => {
	if (req.body.amap) {
		const amap = await Amap.findById(req.body.amap._id)
		if (amap) {
			res.status(201).json({
				_id: amap._id,
				name: amap.name,
				contact: amap.contact,
				accessCode: amap.accessCode,
			})
		} else {
			res.status(400).json({ message: 'Amap not found' })
		}
	} else {
		const amaps = await Amap.find({})

		if (amaps) {
			res.status(201).json(amaps)
		} else {
			res.status(400).json({ message: 'No Amaps Found' })
		}
	}
}

export { registerAmap, getAmapdetails }
