const express = require('express');
const router = express.Router();
const _ = require('lodash');
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const moduleModel = require('../models/module');
const moduleTypeModel = require('../models/module-type');

router.post('/', [auth.verify, admin], async (req, res, next) => {

    const values = _.pick(req.body, ['moduleTypeId', 'name', 'description']);

    const { error } = moduleModel.validateSchema(values);
    if (error) return res.status(400).json({ error: { error: { code: 'invalid-input', message: 'Invalid input' } } })

    const moduleType = (await moduleTypeModel.getModuleTypeById(values.moduleTypeId)).val();

    if (!moduleType) return res.status(400).json({ error: { error: { code: 'invalid-module-type', message: 'Invalid Module Type' } } })

    const result = await moduleModel.createModule({ ...values, creatorUid: req.user.uid });
    res.json(result);
});

router.post('/types', [auth.verify, admin], async (req, res) => {

    const values = _.pick(req.body, ['name']);

    const { error } = moduleTypeModel.validateSchema(values);
    if (error) return res.status(400).json({ error: { error: { code: 'invalid-input', message: 'Invalid input' } } });
    const result = await moduleTypeModel.createModuleType({ ...values, creatorUid: req.user.uid })
    res.json({ message: 'sucessful' });
});

router.get('/types', [auth.verify], async (req, res) => {
    const moduleTypes = await moduleTypeModel.getModuleTypes();
    const values = []
    moduleTypes.forEach(m => values.push({ ...m.val(), _id: m.key }))
    res.json(values);
});

router.get('/', [auth.verify], async (req, res) => {
    const { type } = req.query;
    const values = [];
    const modules = type ? await moduleModel.getModulesByModuleTypeId(type) : await moduleModel.getModules();
    modules.forEach(m => values.push({ ...m.val(), _id: m.key }));
    return res.json(values);
});


router.get('/:moduleId', [auth.verify], async (req, res) => {
    const { moduleId } = req.params;
    if (!moduleId) return res.status(400).json({ error: { error: { code: 'invalid-module', message: 'Invalid Module' } } });

    const values = await moduleModel.getModulesByModuleId(moduleId)
    res.json({ ...values.val(), _id: values.key });
});

module.exports = router;