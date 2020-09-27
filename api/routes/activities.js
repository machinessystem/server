const express = require('express');
const router = express.Router();
const _ = require('lodash');
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const instanceMiddleware = require('../middlewares/instance');
const activityModel = require('../models/activity');
const customize = require('../../lib/customize');

router.post('/', [auth.verify, admin], async (req, res) => {

    const values = _.pick(req.body, ['name']);

    const { error } = activityModel.validateSchema(values);
    if (error) return res.status(400).json({ error: { code: 'invalid-input', message: 'Invalid input' } });

    const result = await activityModel.create({ ...values, creatorUid: req.user.uid })
    res.json(result);
});


router.get('/', [auth.verify], async (req, res) => {
    const activities = await activityModel.getActivities();
    const values = []
    activities.forEach(a => values.push({ ...a.val(), _id: a.key }))
    res.json(values);
});


router.get('/classes', [auth.verify], async (req, res) => {

    const activities = await activityModel.getActivities();

    if (!activities.val()) return res.status(404).json({ error: { code: 'no-activity-found', message: 'No Activity found' } });

    const classes = {}
    activities.forEach(a => {
        classes[customize.strToUnique(a.val()['name'])] = a.key
    })
    res.json(classes);
});

router.get('/definitions/:instanceId', [auth.verify, instanceMiddleware.isAuthorized], async (req, res) => {

    const { instanceId } = req.instance;

    const definitions = await activityModel.getActivityDefinitionsByInstanceId(instanceId);
    if (!definitions.val()) return res.status(404).json({ error: { code: 'no-activity-definition-found', message: 'No Activity definition found' } });
   
    res.json(definitions.val())
});

router.get('/:activityId', [auth.verify], async (req, res) => {
    const { activityId } = req.params;
    if (!activityId) return res.status(400).json({ error: { code: 'invalid-activiity', message: 'Invalid Acivitiy' } });

    const values = await activityModel.getActivityById(activityId)
    res.json({ ...values.val(), _id: values.key });
});




module.exports = router;