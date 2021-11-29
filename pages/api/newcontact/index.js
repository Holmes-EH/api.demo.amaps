import nc from 'next-connect'
import allowCors from '@/utils/allowCors'
import { sendEmail } from '@/lib/sendmail'

const handler = nc({ attachParams: true })

// @desc    Send a message to admin
// @route   POST /api/newContact
// @access  Public
const sendEmailToAdmin = async (req, res) => {
	const { name, email, body } = req.body
	try {
		const emailData = {
			from: `"Juju 2 Fruits" <juju2fruits64@gmail.com>`,
			replyTo: `"${name}" <${email}>`,
			to: `${process.env.ADMIN_EMAIL}`,
			subject: `Message envoyé depuis ${name} depuis juju2fruits.com`,
			text: `${body}`,
			html: `
                <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
                <html>
                    <head>
                        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                    </head>
                    <body>
                        ${body.replace(/(?:\r\n|\r|\n)/g, '<br>')}
                    </body>
                    </html>
                `,
		}
		await sendEmail(emailData)
		res.status(200).json({ message: 'Message envoyé.' })
	} catch (error) {
		res.status(400).json({ message: "Une erreur s'est produite..." })
	}
}

handler.post(async (req, res) => {
	await sendEmailToAdmin(req, res)
})

export default allowCors(handler)
