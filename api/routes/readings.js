const express = require('express');
const router = express.Router();
const _ = require('lodash');
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const instanceMiddleware = require('../middlewares/instance');
const readingsModel = require('../models/reading');
const moduleModel = require('../models/module');

router.get('/:instanceId/:pinNo', [auth.verify, instanceMiddleware.isAuthorized], async (req, res) => {

    const {pinNo} = req.params;
    if (!pinNo) return res.status(401).json({ error: { code: 'invalid-pin-number', message: 'Invalid Pin number' } })

    const { instance } = req;
    const validPinNo = await moduleModel.getModuleRef(instance.val().cpuId).child('description').child('pin_configuration').child(pinNo).once('value');
    if (!validPinNo.val()) return res.status(404).json({ error: { code: 'pin-number-not-found-in-configuration', message: 'pin-number-not-found-in-configuration' } });

    const powerConsumed = await readingsModel.getReadingsByPinNumber(instance.instanceId, pinNo);
    res.json(powerConsumed)
});



module.exports = router;