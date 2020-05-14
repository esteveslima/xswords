const User = require('../models/User')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')

//@desc:    User Login(generating token)
//@route:   POST /api/user/
//@access:  Public 
exports.login = asyncHandler(async (req, res, next) => {

    const { login, password } = req.body
    if (!login || !password) return next(new ErrorResponse('Credentials not provided', 400))

    const user = await User.findOne({ login }).select('+password')      //including password marked as not selected
    if (!user) return next(new ErrorResponse('Invalid user', 401))

    const validPassword = await user.matchPassword(password)
    if (!validPassword) return next(new ErrorResponse('Wrong password', 401))

    const token = user.getSignedJwtToken();

    //request to register in matchmaking server

    const cookieOptions = createCookieOptions()

    res.status(200).cookie('token', token, cookieOptions).json({ status: true, token: token })
});

//@desc:    Validade User(using token)
//@route:   POST /api/user/
//@access:  Public 
exports.authenticate = asyncHandler(async (req, res, next) => {

});





//Aux function to create cookies options
const createCookieOptions = () => {
    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
        httpOnly: true
    }

    if (process.env.NODE_ENV === 'production') options.secure = true

    return options
}