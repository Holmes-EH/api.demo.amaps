import Amap from '@/models/amapModel'
import dbConnect from '@/lib/dbConnect.js'
import generateAccessCode from '@/utils/generateAccessCode'

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

	const amapAccessCodesResult = await Amap.find({}).select('accessCode')
	let amapAccessCodes = []
	amapAccessCodesResult.map((object) => {
		amapAccessCodes.push(object.accessCode)
	})
	let accessCode = generateAccessCode(6)

	// While loop to make sure generated accessCode is unique in db
	while (amapAccessCodes.includes(accessCode)) {
		accessCode = generateAccessCode(6)
	}

	const amap = await Amap.create({
		name,
		contact,
		accessCode,
	})

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
