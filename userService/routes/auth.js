const express = require('express')
const router = express.Router()
const { login, authorization } = require('../controllers/auth')

router.route('/public/login').post(login)
router.route('/public/authorization').get(authorization)

module.exports = router