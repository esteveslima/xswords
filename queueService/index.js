const dotenv = require('dotenv')
dotenv.config({ path: './config/config.env' })

const express = require('./api/express')
const webSocket = require('./socket/webSocket')