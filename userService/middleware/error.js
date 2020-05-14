const ErrorResponse = require('../utils/errorResponse')

const errorHandler = (err, req, res, next) => {
    console.log('Response Error: '.gray + err.message.red.bold)
    let responseError = { ...err }
    responseError.message = err.message

    //Mongoose invalid id
    if (err.name === 'CastError') {
        responseError = new ErrorResponse('Invalid id', 400)
    }
    //Mongoose fields validation error
    if (err.name === 'ValidationError') {
        responseError = new ErrorResponse(Object.values(err.errors).map(value => value.message), 400)
    }
    //Mongoose duplicated key
    if (err.code === 11000) {
        responseError = new ErrorResponse('Duplicated id', 400)
    }

    res.status(responseError.statusCode || 500).json({
        status: false,
        error: responseError.message || 'Server Error'
    })
}

module.exports = errorHandler