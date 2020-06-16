const express = require('express')
const router = express.Router()
const { getUser, createUser, updateUser, deleteUser } = require('../controllers/user')

router.route('/').post(createUser)

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser)

module.exports = router
