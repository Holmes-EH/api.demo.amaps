export default function handler(req, res) {
	res.status(418).json({ message: "I'm a teapot" })
}
