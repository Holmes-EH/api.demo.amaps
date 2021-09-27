import { allowedStatusCodes } from 'next/dist/lib/load-custom-routes'
const numbers = '0123456789'

const generateAccessCode = (length) => {
	let code = ''
	for (let index = 0; index < length; index++) {
		code += numbers.charAt(Math.floor(Math.random() * 10))
	}
	return code
}

export default generateAccessCode
