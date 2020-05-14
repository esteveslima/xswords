//NOT IN USE

//@desc:    Logs requests
const logger = (req, res, next) => {
    console.log(`${req.method} from ${req.protocol}://${req.get('host')}${req.originalUrl}`)
    next()
}

module.exports = logger;