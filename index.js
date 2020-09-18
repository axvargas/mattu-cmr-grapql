const { ApolloServer } = require('apollo-server')
const typeDefs = require('./db/shema')
const resolvers = require('./db/resolvers')

const connectDB = require('./config/db')

// * CONNECT TO DB
connectDB()

// * SERVER
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: () => {
        const myContext = "Hello"
        return {
            myContext
        }
    }
})

// * RUN THE SERVER
server.listen().then(({ url }) => {
    console.log(`Server ready on this URL: ${url}`)
})