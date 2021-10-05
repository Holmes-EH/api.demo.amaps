import Amap from '@/models/amapModel'
import dbConnect from '@/lib/dbConnect.js'
import generateAccessCode from '@/utils/generateAccessCode'

dbConnect()

// @desc    Register a new amap
// @route   POST /api/amaps
// @access  Private + Admin
const registerAmap = async (req, res) => {
	const { name, contact, groupement } = req.body

	const amapExists = await Amap.findOne({ name })

	if (amapExists) {
		res.status(400).json({ message: 'Cette Amap existe déjà' })
	} else {
		const accessCode = await generateAccessCode(6)

		const amap = await Amap.create({
			name,
			contact,
			groupement,
			accessCode,
		})

		if (amap) {
			res.status(201).json({
				_id: amap._id,
				name: amap.name,
				contact: amap.contact,
				groupement: amap.groupement,
				accessCode: amap.accessCode,
			})
		} else {
			res.status(400).json({ message: 'Amap introuvable' })
		}
	}
}

// @desc    Get all amap details
// @route   Get /api/amaps
// @access  Public
const getAllAmaps = async (req, res) => {
	const amaps = await Amap.find({}).sort({ groupement: 'asc' })
	if (amaps) {
		res.status(200).json(amaps)
	} else {
		res.status(404).json({ message: 'Aucune Amap trouvée' })
	}
}

// @desc    Get amap details
// @route   Get /api/amaps/id
// @access  Public
const getAmapDetails = async (req, res) => {
	const amap = await Amap.findById(req.query.id)
	if (amap) {
		res.status(200).json({
			_id: amap._id,
			name: amap.name,
			contact: amap.contact,
			groupement: amap.groupement,
			accessCode: amap.accessCode,
		})
	} else {
		res.status(404).json({ message: 'Amap introuvable' })
	}
}

// @desc    Update Amap details
// @route   PUT /api/amaps
// @access  Private + Admin
const updateAmap = async (req, res) => {
	const amap = await Amap.findById(req.body.id)

	if (amap) {
		amap.name = req.body.name || amap.name
		amap.contact = req.body.contact || amap.contact
		amap.groupement = req.body.groupement || amap.groupement
		if (req.body.updateAccessCode) {
			amap.accessCode = await generateAccessCode(6)
		}
		const updatedAmap = await amap.save()
		res.json({
			_id: updatedAmap._id,
			name: updatedAmap.name,
			contact: updatedAmap.contact,
			groupement: updatedAmap.groupement,
			accessCode: updatedAmap.accessCode,
		})
	} else {
		res.status(404).json({ message: 'Amap introuvable' })
	}
}

// @desc    Delete Amap
// @route   DELETE /api/amap
// @access  Private + Admin
const deleteAmap = async (req, res) => {
	const amap = await Amap.findById(req.query.id)

	if (amap) {
		amap.remove()
		res.json({ message: 'Amap supprimée' })
	} else {
		res.status(404).json({ message: 'Amap introuvable' })
	}
}

export { registerAmap, getAllAmaps, getAmapDetails, updateAmap, deleteAmap }
