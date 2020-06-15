const express = require('express')
const router = express.Router()
const { getQueue } = require('../controllers/queueController')

router.route('/queue').get(getQueue)
router.route('/').get((req, res) => res.status(200).send('Queue Service'))

module.exports = router