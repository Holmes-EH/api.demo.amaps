const allowCors = (fn) => async (req, res) => {
	res.setHeader('Access-Control-Allow-Credentials', true)
	// deepcode ignore TooPermissiveCorsHeader: Api will have to process request from browsers all over france
	res.setHeader('Access-Control-Allow-Origin', '*')
	res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,DELETE,POST,PUT')
	res.setHeader(
		'Access-Control-Allow-Headers',
		'authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
	)
	if (req.method === 'OPTIONS') {
		res.status(200).end()
		return
	}
	return await fn(req, res)
}

export default allowCors
