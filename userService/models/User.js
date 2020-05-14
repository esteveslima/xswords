const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    login: {
        type: String,
        required: [true, 'Login required'],
        unique: true,
        trim: true,
        maxlength: [20, 'Login max length = 20'],
        minLength: [5, 'Login min length = 5']
    },
    password: {
        type: String,
        required: [true, 'Password required'],
        unique: false,
        trim: true,
        select: false,
        maxlength: [30, 'Password max length = 30'],
        minLength: [8, 'Password min length = 8']
    },

    nickName: {
        type: String,
        required: [true, 'nickName required'],
        unique: true,
        trim: true,
        maxlength: [50, 'nickName max length = 50'],
        minLength: [10, 'nickName min length = 10']
    },
    avatar: {
        type: [String],
        required: false,
        default: ['dummy.jpg']
    },
    score: {
        type: Number,
        required: false,
        default: 0,
        min: 0
    }
})

//encrypt password
const bcrypt = require('bcryptjs')
UserSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})
//match requested password with database hashed password
UserSchema.methods.matchPassword = async function (reqPassword) {
    return await bcrypt.compare(reqPassword, this.password)
}

//Sign jwt(json web token)
const jwt = require('jsonwebtoken')
UserSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES })
}



module.exports = mongoose.model('User', UserSchema)