import PasswordReset from '@/models/passwordResetModel.js'
import User from '@/models/userModel.js'
import generateToken from '../utils/generateToken.js'
import { sendEmail } from '@/lib/sendmail'

import dbConnect from '@/lib/dbConnect.js'

dbConnect()

// @desc    Reset a users password
// @route   POST /api/recovery/password
// @access  Public

const getShortToken = async (req, res) => {
	const { email, amap } = req.body

	const userExists = await User.findOne({ email, amap })

	if (!userExists) {
		res.status(404).json({
			message:
				"Nous n'avons pas trouvé d'utilisateur avec cette adresse email...",
		})
	} else {
		const resetPasswordEntry = await PasswordReset.create({
			shortLivedToken: generateToken(userExists._id, '120s'),
			user: userExists._id,
		})
		if (resetPasswordEntry) {
			const emailData = {
				from: `"Juju 2 Fruits" <juju2fruits64@gmail.com>`,
				to: `"${userExists.name}" <${userExists.email}>`,
				subject: `Changez votre mot de passe sur juju2fruits.com`,
				html: `
                    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
                    <html>
                        <head>
                            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                        </head>
                        <body>
                            <p>
                                Bonjour ${userExists.name}.
                            </p>
                            <p>
                                Vous recevez ce mail afin de modifier votre mot de passe sur juju2fruits.com
                            </p>
                            <p>
                                Afin de poursuivre et changer votre mot de passe<br/>
                                veuillez <a href="http://localhost:3000/reset?${resetPasswordEntry.shortLivedToken}&${userExists._id}">cliquer ici.</a>
                            </p>
                            <br />
                            <p>Si vous n'êtes pas à l'origine de cette demande, merci de m'écrire en
                                <a href="${process.env.ADMIN_EMAIL}?subject=J'ai reçu un mail de raz de mot de passe juju2fruits sans l'avoir demandé">cliquant ici</a>  
                            </p>
                        </body>
                        </html>
                    `,
			}
			await sendEmail(emailData)
			res.status(201).json({
				message:
					'Un mail avec un lien de remise à zéro vient de vous être envoyé.\nVerifiez vos mails. Et même dans les spams, au cas où ?',
			})
		}
	}
}

export { getShortToken }
