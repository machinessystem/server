const express = require('express');
const router = express.Router();
const _ = require('lodash');
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const instanceMiddleware = require('../middlewares/instance');
const pinModel = require('../models/pin');
const moduleModel = require('../models/module');


router.get('/configurations/:moduleId', [auth.verify], async (req, res) => {

    const { moduleId } = req.params;
    if (!moduleId) return res.status(400).json({ error: { code: 'invalid-module', message: 'Invalid module' } });

    const _module = (await moduleModel.getModulesByModuleId(moduleId)).val();
    if (!_module)
        return res.status(404).json({});

    const pins = [];
    const pinConfiguration = await pinModel.getPinConfigurationsByModuleId(moduleId);

    if (!pinConfiguration.val()) return res.status(404).json({ error: { code: 'no-pin-configuraitons-found', message: 'No Pin configuration found' } });

    pinConfiguration.forEach(i => {//Here new lines resolves the issue to get all instances instead of single one
        pins.push({ no: i.key, ...i.val() })
    });
    return res.json(pins);
});

router.get('/definitions/:instanceId', [auth.verify, instanceMiddleware.isAuthorized], async (req, res) => {

    const instance = req.instance;

    const pinConfiguration = await pinModel.getPinConfigurationsByModuleId(instance.val()['cpuId']);

    if (!pinConfiguration.val()) return res.status(404).json({ error: { code: 'no-pin-configuration-found', message: 'No Pin Configuration found for selected CPU' } });

    const pins = [];
    const pinDefinitions = await pinModel.getPinDefinitionsByInstanceId(instance.instanceId);

    if (!pinDefinitions.val()) return res.status(404).json({ error: { code: 'no-pin-definitions-found', message: 'No Pin Definition found' } });

    pinDefinitions.forEach(i => {//Here new lines resolves the issue to get all instances instead of single one
        pins.push({ no: i.key, ...i.val(), ...pinConfiguration.val()[i.key] })
    });
    return res.json(pins);
});


router.post('/definitions/:instanceId', [auth.verify, instanceMiddleware.isAuthorized], async (req, res) => {

    const { error } = pinModel.validateSchema(req.body);
    if (error) return res.status(400).json({ error: { code: 'invalid-input', message: 'Invalid input' } });

    const instance = req.instance;

    const pinConfiguration = await pinModel.getPinConfigurationsByModuleId(instance.val()['cpuId']);

    if (!pinConfiguration.val()) return res.status(404).json({ error: { code: 'no-pin-configuration-found', message: 'No Pin Configuration found for selected CPU' } });

    const values = _.keyBy(req.body, 'no');
    const result = await pinModel.addPinDefinition(instance.instanceId, values);
    res.json({ error: { code: 'pin-definition-save', message: "Pin Definition Saved" } });
});


router.delete('/definitions/:instanceId', [auth.verify, instanceMiddleware.isAuthorized], async (req, res) => {

    const instance = req.instance;

    const pinDefsRef = pinModel.getPinDefinitionsRefByInstanceId(instance.instanceId);
    if (!(await pinDefsRef.once('value')).val())
        return res.status(404).json({ error: { code: 'pin-definition-not-founf', message: 'Pin definitions not found' } });

    const result = await pinDefsRef.remove();
    res.json({ message: `Pin definitions deleted` });
});

router.delete('/definitions/:instanceId/:pinNo', [auth.verify, instanceMiddleware.isAuthorized], async (req, res) => {

    const { pinNo } = req.params;
    if (!pinNo) return res.status(400).json({ error: { code: 'invalid-pin-no', message: 'Invalid Pin number' } });

    const instance = req.instance;

    const pinNoDefRef = pinModel.getPinRefBInstanceId(instance.instanceId, pinNo);
    if (!(await pinNoDefRef.once('value')).val())
        return res.status(404).json({ error: { code: 'invalid-pin-no', message: 'Invalid Pin number' } });

    const result = await pinNoDefRef.remove();
    res.json({ message: `Pin number ${pinNo} deleted` })
});


module.exports = router;