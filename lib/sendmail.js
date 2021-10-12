import nodemailer from 'nodemailer'
import User from '@/models/userModel.js'
import Amap from '@/models/amapModel'

// mailData example :
// const mailData = {
// 	from: '"Fred Foo 👻" <foo@example.com>', // sender address
// 	to: 'bar@example.com, baz@example.com', // list of receivers
// 	subject: 'Hello ✔', // Subject line
// 	text: 'Hello world?', // plain text body
// 	html: '<b>Hello world?</b>', // html body
// }

const buildEmailData = async ({ client, details, amap, session }) => {
	const user = await User.findById(client)
	const userAmap = await Amap.findById(amap)

	let mailData = {
		from: 'juju2fruits64@gmail.com',
		to: user.email,
		subject: 'Votre commande sur juju2fruits.com',
		text: 'Bonjour et merci pour votre commande sur juju2fruits.com !\nVoici le récapitulatif :\ninsert data here',
		html: `
            <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
            <html>
                <head>
                    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                </head>
                <body>
                <p>
                    Bonjour et merci pour votre commande sur juju2fruits.com !
                </p>
                <p>
                    Livraison prévue à ${userAmap.name}
                </p>
                <p>
                    Voici le récapitulatif :
                </p>
                <p>
                    <i>insert data here</i>
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
		console.log('Message sent: %s', info)
	} catch (error) {
		console.log(error)
	}
}

export { buildEmailData, sendEmail }
