const express = require('express')
const cors = require('cors')
const morgan = require('morgan')



const app = express()

var corsOptions = {
        origin: '*',
        methods: ['OPTIONS', 'GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Access-Token'],
        exposedHeaders: ['Access-Token']
    };
app.use(cors(corsOptions));

app.use(express.json())

app.use(morgan('dev'))

const matchesRouter = require('./routes/match')
app.use('/', matchesRouter)

const expressServer = app.listen(
  process.env.PORT_EXPRESS, 
  console.log(`${process.env.NODE_ENV} game express server, running on port ${process.env.PORT_EXPRESS}`)
);