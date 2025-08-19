// Middleware para controlar el registro público.
// Permite el registro libre solo si REGISTER_OPEN==='true'.
// Cuando REGISTER_OPEN !== true solo deja pasar si viene un invitationCode
// (el handler de /register validará el código) para no exponer que existe el endpoint.

function registerGuard(req, res, next) {
	const open = process.env.REGISTER_OPEN === 'true';
	if (!open && !req.body?.invitationCode) {
		return res.status(404).json({ success: false, message: 'Not found' });
	}
	next();
}

module.exports = { registerGuard };
