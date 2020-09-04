const User = require('../models/User')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const jwt = require('jsonwebtoken');

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

//@desc:    Authorize User(using token)
//@route:   GET /public/authorization/
//@access:  Public 
exports.authorization = asyncHandler(async (req, res, next) => {
    // Pattern as "Bearer JSON_WEB_TOKEN" in the headers or {"token": JSON_WEB_TOKEN} in the cookie
  const { authorization } = req.headers;
  const token = authorization ? authorization.split(' ')[1] : req.cookies.token;
  console.log(`token: ${token}`)
  try {
    const decodedToken =  jwt.verify(token, process.env.JWT_SECRET);
    console.log(decodedToken)
    // req.userId = decodedToken.id;
    res.status(200).json({ Status: true })
  } catch (e) {
    res.status(401).json({ Status: false, message: "Unhauthorized, please authenticate" })
  }
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