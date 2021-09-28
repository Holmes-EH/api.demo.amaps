import Amap from '@/models/amapModel'
import dbConnect from '@/lib/dbConnect.js'
import generateAccessCode from '@/utils/generateAccessCode'

dbConnect()

// @desc    Register a new amap
// @route   POST /api/amaps
// @access  Private + Admin
const registerAmap = async (req, res) => {
	const { name, contact } = req.body

	const amapExists = await Amap.findOne({ name })

	if (amapExists) {
		res.status(400).json({ message: 'Amap already exists' })
	}

	const accessCode = await generateAccessCode(6)

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
			res.status(200).json({
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
			res.status(200).json(amaps)
		} else {
			res.status(400).json({ message: 'No Amaps Found' })
		}
	}
}

// @desc    Update Amap details
// @route   PUT /api/users
// @access  Private + Admin
const updateAmap = async (req, res) => {
	const amap = await Amap.findById(req.body._id)

	if (amap) {
		amap.name = req.body.name || amap.name
		amap.contact = req.body.contact || amap.contact
		if (req.body.updateAccessCode) {
			amap.accessCode = await generateAccessCode(6)
		}
		const updatedAmap = await amap.save()
		res.json({
			_id: updatedAmap._id,
			name: updatedAmap.name,
			contact: updatedAmap.contact,
			accessCode: updatedAmap.accessCode,
		})
	} else {
		res.status(404).json({ message: 'Amap not Found' })
	}
}

// @desc    Delete Amap
// @route   DELETE /api/amap
// @access  Private + Admin
const deleteAmap = async (req, res) => {
	const amap = await Amap.findById(req.body._id)

	if (amap) {
		amap.remove()
		res.json({ message: 'Amap deleted' })
	} else {
		res.status(404).json({ message: 'Amap not found' })
	}
}

export { registerAmap, getAmapdetails, updateAmap, deleteAmap }
