const express = require('express')
const cors = require('cors')
const morgan = require('morgan')



const app = express()

var corsOptions = {
        origin: '*',
        methods: ['OPTIONS', 'GET', 'POST', 'PUT', 'DELETE'],
    };
app.use(cors(corsOptions));

app.use(express.json())

app.use(morgan('dev'))

const queueRouter = require('./routes/queue')
app.use('/', queueRouter)

/*
const expressServer = app.listen(
  process.env.PORT_EXPRESS, 
  console.log(`${process.env.NODE_ENV} game express server, running on port ${process.env.PORT_EXPRESS}`)
);
*/

module.exports.app = app