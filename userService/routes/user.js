const express = require('express')
const router = express.Router()
const { getUser, createUser, updateUser, deleteUser, updatePlayersScores } = require('../controllers/user')

router.route('/').post(createUser)

router.route('/updatePlayersScores').post(updatePlayersScores)

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser)

module.exports = router
