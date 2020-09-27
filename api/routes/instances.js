const express = require('express');
const router = express.Router();
const _ = require('lodash');
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const instanceMiddleware = require('../middlewares/instance');
const instanceModel = require('../models/instance');
const moduleModel = require('../models/module');
const activityModel = require('../models/activity');
const pinModel = require('../models/pin');
const readingsModel = require('../models/reading');
const iamsModel = require('../models/iam');
const presenseModel = require('../models/presense');

router.post('/', [auth.verify], async (req, res) => {

    const values = _.pick(req.body, ['name', 'cpuId', 'comnDeviceId', 'activityId']);

    const { error } = instanceModel.validateSchema(values);
    if (error) return res.status(400).json({ error: { code: 'invalid-input', message: 'Invalid input' } })

    const cpu = (await moduleModel.getModulesByModuleId(values.cpuId)).val();
    if (!cpu) return res.status(400).json({ error: { code: 'invalid-cpu', message: 'Invalid CPU' } })

    const comnDevice = (await moduleModel.getModulesByModuleId(values.comnDeviceId)).val();
    if (!comnDevice) return res.status(400).json({ error: { code: 'invalid-comn-device', message: 'Invalid Communication Device' } })

    const activity = (await activityModel.getActivityById(values.activityId)).val();
    if (!activity) return res.status(400).json({ error: { code: 'invalid-activity', message: 'Invalid Activity' } })

    const result = await instanceModel.createInstance({ ...values, ownerUid: req.user.uid });
    res.json({ instanceId: result.key });
});

router.get('/myInstances', [auth.verify], async (req, res) => {

    const values = [];
    const ownerInstances = await instanceModel.getInstancesByOwner(req.user.uid);

    ownerInstances.forEach(i => {//Here new lines resolves the issue to get all instances instead of single one
        values.push({ ...i.val(), _id: i.key })
    });
    return res.json(values);
});


router.get('/:instanceId', [auth.verify, instanceMiddleware.isAuthorized], async (req, res) => {

    const instance = req.instance;

    const value = { ...instance.val(), _id: instance.key }
    return res.json(value);
});

router.get('/presense/:instanceId', [auth.verify, instanceMiddleware.isAuthorized], async (req, res) => {

    const { instanceId } = req.instance;

    const presense = await presenseModel.getInstancePresenseRef(instanceId).once('value');
    if (!presense.val()) return res.status(404).json({ error: { code: 'no-instance-presence', message: 'Invalid presence not found' } });

    res.json(presense.toJSON())
});

router.delete('/:instanceId', [auth.verify, instanceMiddleware.isAuthorized], async (req, res) => {

    const { instanceId } = req.instance;

    try {

        const pinDefsRef = pinModel.getPinDefinitionsRefByInstanceId(instanceId);
        if ((await pinDefsRef.once('value')).val()) pinDefsRef.remove();

        const pinReadingsRef = readingsModel.getInstanceReadingsRef(instanceId);
        if ((await pinReadingsRef.once('value')).val()) pinReadingsRef.remove();

        const iamsRef = iamsModel.getInstanceIAMsRef(instanceId);
        if ((await iamsRef.once('value')).val()) iamsRef.remove();

        const instancePresenseRef = presenseModel.getInstancePresenseRef(instanceId);
        if ((await instancePresenseRef.once('value')).val()) instancePresenseRef.remove();

        const deleted = await instanceModel.deleteInstance(instanceId);

        res.json({ message: `Instance ${instanceId} deleted along with its readings and defintions` });
    }
    catch (ex) {
        res.status(500).json(ex)
    }

});

module.exports = router;