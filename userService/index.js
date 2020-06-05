const express = require('express')
const dotenv = require('dotenv')
const colors = require('colors')
const cors = require('cors')

const app = express()

//
var corsOptions = {
        origin: '*',
        methods: ['OPTIONS', 'GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Access-Token'],
        exposedHeaders: ['Access-Token']
    };
app.use(cors(corsOptions));

//Body parser
app.use(express.json())

//Env Variables
dotenv.config({ path: './config/config.env' })

//Database
const connectDatabase = require('./config/database')
connectDatabase()

//Middleware Logger
const morgan = require('morgan')
app.use(morgan('dev'))
const cookieParser = require('cookie-parser')
app.use(cookieParser())

//Routers
const usersRouter = require('./routes/user')
app.use('/api/user', usersRouter)
const authenticationRouter = require('./routes/auth')
app.use('/api/auth', authenticationRouter)

//Middleware Error Handler
const errorhandler = require('./middleware/error')
app.use(errorhandler)

//Start Server
const PORT = process.env.PORT || 5000
const server = app.listen(PORT, console.log(`${process.env.NODE_ENV} server, running on port ${process.env.PORT}`.blue.bold)
);

//Handle unhandled rejections closing the server
process.on('unhandledRejection', (err, promise) => {
  console.log(`unhandled Rejection Error: ${err.message}`.bgRed)
  server.close(() => process.exit(1))
})