import Amap from '@/models/amapModel'
import dbConnect from '@/lib/dbConnect.js'

const numbers = '0123456789'
dbConnect()

const generateAccessCode = async (length) => {
	const amapAccessCodesResult = await Amap.find({}).select('accessCode')
	let amapAccessCodes = []
	amapAccessCodesResult.map((object) => {
		amapAccessCodes.push(object.accessCode)
	})
	let code = ''

	for (let index = 0; index < length; index++) {
		code += numbers.charAt(Math.floor(Math.random() * 10))
	}

	// While loop to make sure generated accessCode is unique in db
	while (amapAccessCodes.includes(code)) {
		for (let index = 0; index < length; index++) {
			code += numbers.charAt(Math.floor(Math.random() * 10))
		}
	}

	return code
}

export default generateAccessCode
