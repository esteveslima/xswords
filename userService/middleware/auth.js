const jwt = require('jsonwebtoken')
const asyncHandler = require('./async')
const ErrorResponse = require('../utils/errorResponse')
const User = require('../models/User')

//Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
    let token

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]     //Convention is "Bearer [token]"
    } else if (req.cookies.token) {
        token = req.cookies.token
    }

    if (!token) return next(new ErrorResponse('Authorization required', 401))

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = await user.findById(decoded.id)
        next()
    } catch (err) {
        return next(new ErrorResponse('Authorization denied', 401))
    }

})