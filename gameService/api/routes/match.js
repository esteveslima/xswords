const express = require('express')
const router = express.Router()
const { generateMatch, verifyMatch } = require('../controllers/matchController')

router.route('/generateMatch').get(generateMatch)
router.route('/verifyMatch/:nameSpace').get(verifyMatch)
router.route('/').get((req, res) => res.status(200).send('Game Service'))

module.exports = router