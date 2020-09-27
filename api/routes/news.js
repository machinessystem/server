const express = require('express');
const router = express.Router();
const news = require('../models/news');

router.get('/', async (req, res) => {
    const result = await news.getNews();
    if (!result) return res.status(404).json({ error: { code: 'not-found', message: 'No data found' } });
    res.json(result)

});




module.exports = router;