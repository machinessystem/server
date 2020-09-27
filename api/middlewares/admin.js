

module.exports = (req, res, next) => {
    if (!req.user.admin) return res.status(403).json({ error: { code: 'unathorized' } });
    if (req.user.admin === true) next();
};