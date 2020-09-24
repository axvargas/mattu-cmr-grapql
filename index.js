const { ApolloServer } = require('apollo-server')
const jwt = require('jsonwebtoken')
require('dotenv').config({ path: 'variables.env' })

const typeDefs = require('./db/shema')
const resolvers = require('./db/resolvers')

const connectDB = require('./config/db')

// * CONNECT TO DB
connectDB()

// * SERVER
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
        const token = req.headers['authorization'] || ""
        if (token) {
            try {
                const user = jwt.verify(token.replace('Bearer ', ''), process.env.SECRET)
                return {
                    user
                }
            } catch (error) {
                console.log(error)
                if (error.message === 'invalid token') {
                    throw new Error("Invalid token")
                }
                throw new Error("No authorization, your session might have expired")
            }
        }else{
            console.log("No Token");
        }
    }
})

// * RUN THE SERVER
server.listen().then(({ url }) => {
    console.log(`Server ready on this URL: ${url}`)
})