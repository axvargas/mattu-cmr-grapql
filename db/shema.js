const { gql } = require('apollo-server')
// * SCHEMA
const typeDefs = gql`
   
    input UserInput {
        firstName: String!
        lastName: String!
        email: String!
        password: String!
    }

    input AuthInput {
        email: String!
        password: String!
    }
    
    type User {
        id: ID
        firstName: String
        lastName: String
        email: String
        createdAt: String
    }

    type Token {
        token: String
    }

    type Query {
        getAuthenticatedUser(token: String!): User
    }

    type Mutation {
        createUser(input: UserInput!): User
        authenticateUser(input: AuthInput!): Token
    }
`

module.exports = typeDefs