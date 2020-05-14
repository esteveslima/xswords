const express = require('express')
const router = express.Router()
const { login, authenticate } = require('../controllers/auth')

router.route('/login').post(login)
router.route('/authenticate').post(authenticate)

module.exports = router