function requireAuth(req, res, next) {
	if (!req.session || !req.session.user) {
		return res.status(401).json({ ok: false, message: "No autenticado" });
	}

	req.user = req.session.user;
	return next();
}

module.exports = { requireAuth };
