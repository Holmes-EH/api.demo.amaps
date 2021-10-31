import OrderRecap from '@/models/orderRecapModel'
import Order from '@/models/orderModel'
import User from '@/models/userModel'
import Amap from '@/models/amapModel'

import { sendEmail } from '@/lib/sendmail'

import dbConnect from '@/lib/dbConnect.js'

dbConnect()

// @desc    Update Order details
// @route   PUT /api/orders/recaps/update
// @access  Private
const updateRecapDeliveryDate = async (req, res) => {
	const recap = await OrderRecap.findById(req.body._id)

	if (recap) {
		recap.delivery = req.body.date || recap.delivery
		const newRecap = await recap.save()
		res.status(200).json(newRecap)
	} else {
		res.status(404).json({ message: 'Recapitulatif introuvable...' })
	}
}

export { updateRecapDeliveryDate }
