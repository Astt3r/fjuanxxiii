// Middleware para controlar el registro público.
// Permite el registro libre solo si REGISTER_OPEN==='true'.
// Si no está abierto, devolvemos 404 para no revelar el endpoint.

function registerGuard(_req, res, next) {
	const open = process.env.REGISTER_OPEN === 'true';
	if (!open) return res.status(404).json({ success: false, message: 'Not found' });
	next();
}

module.exports = { registerGuard };
