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

    input ProductInput {
        name: String!
        stock: Int!
        price: Float!
    }

    input ProductUpdateInput {
        name: String
        stock: Int
        price: Float
    }

    input ClientInput {
        firstName: String!
        lastName: String!
        company: String!
        email: String!
        telephone: String
    }

    input ClientUpdateInput {
        firstName: String
        lastName: String
        company: String
        email: String
        telephone: String
    }

    input OrderProductInput {
        id: ID!
        quantity: Int!
    }

    input OrderInput {
        order: [OrderProductInput]
        total: Float!
        client: ID!
        state: OrderState
    }

    enum OrderState {
        PENDING
        COMPLETED
        CANCELED
    }
    
    
    type User {
        id: ID
        firstName: String
        lastName: String
        email: String
        createdAt: String
    }

    type Product {
        id: ID
        name: String
        stock: Int
        price: Float
        createdAt: String
    }

    type Client {
        id: ID
        firstName: String
        lastName: String
        company: String
        email: String
        telephone: String
        createdAt: String
        seller: ID
    }

    type Order {
        id: ID
        order: [OrderProduct]
        total: Float
        client: ID
        seller:ID
        state: OrderState
        createdAt: String
    }

    type OrderProduct {
        id: ID
        quantity: Int
    }

    type Token {
        token: String
    }

    type Query {
        # Users
        getAuthenticatedUser(token: String!): User

        # Products
        getAllProducts: [Product]
        getProductById(id: ID!): Product

        # Clients
        getAllClients: [Client]
        getClientBySeller: [Client]
        getClientById(id: ID!): Client

        # Order
        getAllOrders: [Order]
        getOrderBySeller: [Order]
        getOrderById(id: ID!): Order
    }

    type Mutation {
        # Users
        createUser(input: UserInput!): User
        authenticateUser(input: AuthInput!): Token

        # Products
        createProduct(input: ProductInput!): Product
        updateProduct(id: ID!, input: ProductUpdateInput!): Product
        deleteProdct(id: ID!): String

        # Clients
        createClient(input: ClientInput!): Client
        updateClient(id: ID!, input: ClientUpdateInput!): Client
        deleteClient(id: ID!): String

        # Order
        createOrder(input: OrderInput!): Order
        updateOrder(id: ID!, input: OrderInput!): Order
        deleteOrder(id: ID!): String
    }
`

module.exports = typeDefs