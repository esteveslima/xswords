const User = require('../models/User')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')


//@desc:    Create User
//@route:   POST /api/user/
//@access:  Public 
exports.createUser = asyncHandler(async (req, res, next) => {
    const user = await User.create(req.body)

    const token = user.getSignedJwtToken()

    res.status(200).json({ status: true, token: token })
});


//@desc:    Get User
//@route:   GET /api/user/:id
//@access:  Public
exports.getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id)

    if (!user) return next(new ErrorResponse('Not found', 404))

    res.status(200).json({ status: true, user: user })
})

//@desc:    Update User
//@route:   PUT /api/user/:id
//@access:  Public***************************************************************
exports.updateUser = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    if (!user) return next(new ErrorResponse('Not found', 404))

    res.status(200).json({ status: true, user: user })
})

//@desc:    Delete User
//@route:   DELETE /api/user/:id
//@access:  Public*****************************************************************
exports.deleteUser = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.params.id)

    if (!user) return next(new ErrorResponse('Not found', 404))

    res.status(200).json({ status: true, user: user })
})

//@desc:    Update User
//@route:   PUT /api/user/:id
//@access:  Public***************************************************************
exports.updatePlayersScores = asyncHandler(async (req, res, next) => {

    let allPlayersUpdated = true;
    for(let player of req.body.players){
        const user = await User.findByIdAndUpdate(player.id, {
            $inc: { score: player.score }
        })
        if(!user) allPlayersUpdated = false;
    }

    if(!allPlayersUpdated) return next(new ErrorResponse('Error while updating players score', 500))

    res.status(200).json({ status: true })
})