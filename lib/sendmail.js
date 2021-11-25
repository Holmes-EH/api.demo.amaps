import nodemailer from 'nodemailer'
import User from '@/models/userModel.js'
import Amap from '@/models/amapModel'
import Session from '@/models/sessionModel'
import OrderRecap from '@/models/orderRecapModel'

const buildEmailData = async ({ client, details, amapId, session }) => {
	const user = await User.findById(client)
	const amap = await Amap.findById(amapId)
	const currentSession = await Session.findOne({ session })
	const orderRecap = await OrderRecap.findOne({
		amap: amapId,
		session,
	})

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
			if (detail.quantity > 0) {
				if (detail.product.unitOnly) {
					textToSend += `${detail.quantity} ${detail.product.title}, `
				} else {
					textToSend += `${detail.quantity} kg ${elision(
						detail.product.title
					)}, `
				}
			}
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
			if (detail.quantity > 0) {
				if (detail.product.unitOnly) {
					htmlToSend += `${detail.quantity} ${detail.product.title}, `
				} else {
					htmlToSend += `${detail.quantity} kg ${elision(
						detail.product.title
					)}, `
				}
			}
		})

		htmlToSend += ` pour un montant de ${orderTotal()} €</p>`
		return htmlToSend
	}

	let mailData = {
		from: `"Juju 2 Fruits" ${process.env.ADMIN_EMAIL}`,
		to: user.email,
		subject: 'Commandes agrumes',
		text: `
            Bonjour ${user.name}.\n
            Votre commande a bien été enregistrée !\n
            ${detailText()}\n
            Livraison de votre commande le ${new Date(
				orderRecap.delivery
			).toLocaleDateString('fr-FR', {
				weekday: 'long',
				day: 'numeric',
				month: 'long',
			})} vers ${amap.deliveryTime} sur l’amap ${amap.name}.\n
            Si vous souhaitez modifier votre commande vous pouvez la modifier jusqu’au ${new Date(
				currentSession.lastOrderDate
			).toLocaleDateString('fr-FR', {
				weekday: 'long',
				day: 'numeric',
				month: 'long',
			})}.\n
            Merci!\n
            Juju2fruits
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
                        Votre commande a bien été enregistrée !
                    </p>
                    ${detailHtml()}
                    <p>
                        Livraison de votre commande le ${new Date(
							orderRecap.delivery
						).toLocaleDateString('fr-FR', {
							weekday: 'long',
							day: 'numeric',
							month: 'long',
						})} vers ${amap.deliveryTime} sur l’amap ${amap.name}.
                    </p>
                    <p>
                        Si vous souhaitez modifier votre commande vous pouvez la modifier jusqu’au ${new Date(
							currentSession.lastOrderDate
						).toLocaleDateString('fr-FR', {
							weekday: 'long',
							day: 'numeric',
							month: 'long',
						})}
                    </p>
                    <p>
                        Merci!</br>
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
		throw error
	}
}

export { buildEmailData, sendEmail }
