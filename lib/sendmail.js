import nodemailer from 'nodemailer'
import User from '@/models/userModel.js'

const buildEmailData = async ({ client, details, amap }) => {
	const user = await User.findById(client)
	const elision = (productTitle) => {
		const vowels = ['a', 'e', 'i', 'o', 'u', 'y', 'h']
		if (vowels.includes(productTitle.slice(0, 1).toLowerCase())) {
			return `d'${productTitle.toLowerCase()}`
		} else {
			return `de ${productTitle.toLowerCase()}`
		}
	}
	const getOrderTotal = (total, detail) => {
		return total + detail.quantity * detail.product.pricePerKg
	}
	const detailText = () => {
		let textToSend = ''
		const orderTotal = () => {
			return details.reduce(getOrderTotal, 0).toFixed(2)
		}
		details.map((detail) => {
			textToSend += `${detail.quantity} kg ${elision(
				detail.product.title
			)}, `
		})
		textToSend += ` pour un montant de ${orderTotal()} €`
		return textToSend
	}

	const detailHtml = () => {
		let htmlToSend = '<p>'
		const orderTotal = () => {
			return details.reduce(getOrderTotal, 0).toFixed(2)
		}
		details.map((detail) => {
			htmlToSend += `${detail.quantity} kg ${elision(
				detail.product.title
			)}, `
		})

		htmlToSend += ` pour un montant de ${orderTotal()} €</p>`
		return htmlToSend
	}

	let mailData = {
		from: '"Juju 2 Fruits" <juju2fruits64@gmail.com>',
		to: user.email,
		subject: 'Votre commande sur juju2fruits.com',
		text: `
            Bonjour ${user.name}.\n
            J'ai bien reçu votre commande.\n
            Voici le récapitulatif :\n
            ${detailText()}\n
            Je vous communiquerai la date de livraison prochainement.\n
            Cordialement,\n
            Juju2Fruits
        `,
		html: `
            <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
            <html>
                <head>
                    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                </head>
                <body>
                    <p>
                        Bonjour ${user.name}. 
                    </p>
                    <p>
                        J'ai bien reçu votre commande.</br>
                        Voici le récapitulatif :
                    </p>
                    ${detailHtml()}
                    <p>
                        Je vous communiquerai la date de livraison prochainement.
                    </p>
                    <p>
                        Cordialement,</br>
                        Juju2Fruits
                    </p>
                </body>
            </html>
        `,
	}
	return mailData
}

const sendEmail = async (mailData) => {
	const transporter = nodemailer.createTransport({
		host: 'smtp.gmail.com',
		port: 465,
		secure: true,
		auth: {
			user: 'juju2fruits64',
			pass: process.env.GMAIL_PWD,
		},
	})

	try {
		const info = await transporter.sendMail(mailData)
		console.log('Message sent: %s', info.messageId)
	} catch (error) {
		console.log(error)
	}
}

export { buildEmailData, sendEmail }
