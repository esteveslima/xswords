const express = require('express')
const router = express.Router()
const { generateMatch } = require('../controllers/matchController')

router.route('/generateMatch').get(generateMatch)

module.exports = router