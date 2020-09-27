const express = require('express');
const router = express.Router();
const about = require('../models/meta');

router.get('/', async (req, res) => {
    const result = await about.getMeta();
    if (!result) return res.status(404).json({ error: { code: 'not-found', message: 'No data found' } })
    res.json(result)

});

router.get('/about', async (req, res) => {
    const result = await about.getAbout();
    if (!result) return res.status(404).json({ error: { code: 'not-found', message: 'No data found' } })
    res.json(result)

});




module.exports = router;