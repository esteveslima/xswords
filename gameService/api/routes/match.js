const express = require('express')
const router = express.Router()
const { generateMatch } = require('../controllers/matchController')

router.route('/generateMatch').get(generateMatch)
router.route('/').get((req, res) => res.status(200).send('Game Service'))

module.exports = router