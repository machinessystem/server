const instanceModel = require('../models/instance');

const isAuthorized = async (req, res, next) => {
    const { instanceId } = req.params;
    if (!instanceId) return res.status(400).json({ error: { code: 'invalid-instance', message: 'Invalid Instance' } });

    const instance = await instanceModel.getInstanceById(instanceId);

    if (!instance.val())
        return res.status(404).json({ error: { code: 'instance-not-found', message: 'Invalid nout found' } });

    const invalidAuthorization = (instance.val()['ownerUid'] !== req.user.uid)
        && !(req.user.admin || req.user.admin == true)

    if (invalidAuthorization)
        return res.status(401).json({ error: { code: 'no-access-priviledge', message: 'No access priviledge' } });

    req.instance = instance;
    req.instance.instanceId = instance.key;
    next();
}

module.exports = { isAuthorized }