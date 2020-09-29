const admin = require('firebase-admin');
const db = admin.database();
module.exports = async (req, res, next) => {
    console.log(req.body);
    const { instanceId } = req.body;
    if (!instanceId) return res.status(404).send('error:no-instanceId');
    const instance = await db.ref(`instances/${instanceId}`).once('value');
    if (!instance.val()) return res.status(404).send('error:invalid-instance');
    req.instance = instance;
    next()
}