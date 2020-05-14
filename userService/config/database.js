const mongoose = require('mongoose')

const connect = async () => {
    const connection = await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    });

    console.log(`Connected to Database: ${connection.connection.host}`.cyan.italic)
}

module.exports = connect