const mongoose = require('mongoose')
require('dotenv').config({ path: 'variables.env' })

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_MONGO, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        })
        console.log("Connected to DB")
    } catch (error) {
        console.log("There was an error while connecting to the DB")
        console.log("ERROR: ", error)
        process.exit(1)
    }
}

module.exports = connectDB