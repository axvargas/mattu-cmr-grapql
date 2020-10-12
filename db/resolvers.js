const User = require('../models/User')
const Product = require('../models/Product')
const Client = require('../models/Client')
const Order = require('../models/Order')

const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config({ path: 'variables.env' })

// ! This was for practice
const courses = [
	{
		title: 'JavaScript Moderno Guía Definitiva Construye +10 Proyectos',
		technology: 'JavaScript ES6',
	},
	{
		title: 'React – La Guía Completa: Hooks Context Redux MERN +15 Apps',
		technology: 'React',
	},
	{
		title: 'Node.js – Bootcamp Desarrollo Web inc. MVC y REST API’s',
		technology: 'Node.js'
	},
	{
		title: 'ReactJS Avanzado – FullStack React GraphQL y Apollo',
		technology: 'React'
	}
];
// !-----------------------


const generateToken = async (user, secret, expiresIn) => {
	const { id, firstName, lastName, email } = user
	const payload = {
		id,
		firstName,
		lastName,
		email
	}
	return jwt.sign(payload, secret, { expiresIn })
}

// * RESOLVERS
const resolvers = {

	Query: {
		getAuthenticatedUser: (_, { }, ctx) => {
			console.log(ctx);
			return ctx.user
		},



		getAllProducts: async () => {
			try {
				const products = await Product.find({})
				return products
			} catch (error) {
				throw new Error('The user does not exist')
			}
		},
		getProductById: async (_, { id }) => {
			try {
				// * Check if the product exists
				const product = await Product.findById(id)
				if (!product) {
					throw new Error("The product does not exist")
				}
				return product
			} catch (error) {
				throw new Error(error.message)
			}
		},


		getAllClients: async () => {
			try {
				const clients = await Client.find({})
				return clients
			} catch (error) {
				throw new Error(error.message)
			}
		},
		getClientsBySeller: async (_, { }, ctx) => {
			try {
				const { user } = ctx
				if (!user) {
					throw new Error('You are not authorized')
				}
				const clients = await Client.find({ seller: user.id.toString() })
				return clients
			} catch (error) {
				throw new Error(error.message)
			}
		},
		getClientById: async (_, { id }, ctx) => {
			try {
				const { user } = ctx

				// * Check if the client exists
				const client = await Client.findById(id)
				if (!client) {
					throw new Error("The client does not exist")
				}

				// * Just who created the client can see it
				if (client.seller.toString() !== user.id) {
					throw new Error("You are not authorized to see this information")
				}

				return client
			} catch (error) {
				throw new Error(error.message)
			}
		},


		getAllOrders: async () => {
			try {
				const orders = await Order.find({})
				return orders
			} catch (error) {
				throw new Error(error.message)
			}
		},
		getOrderBySeller: async (_, { }, ctx) => {
			try {
				const { user } = ctx

				const orders = await Order.find({ seller: user.id.toString() }).populate('client')
				console.log(orders);
				return orders
			} catch (error) {
				throw new Error(error.message)
			}
		},
		getOrderById: async (_, { id }, ctx) => {
			try {
				const { user } = ctx

				// * Check if the order exists
				const order = await Order.findById(id)
				if (!order) {
					throw new Error("The order does not exist")
				}

				// * Just who created the order can see it
				if (order.seller.toString() !== user.id) {
					throw new Error("You are not authorized to see this information")
				}

				return order
			} catch (error) {
				throw new Error(error.message)
			}
		},
		getOrderByStatus: async (_, { state }, ctx) => {
			const orders = await Order.find({ seller: ctx.user.id, state })
			return orders
		},


		getBestClients: async () => {
			const bestClients = await Order.aggregate([
				{
					$match: {
						state: "COMPLETED"
					}
				},
				{
					$group: {
						_id: '$client',
						total: { $sum: '$total' }
					}
				},
				{
					$lookup: {
						from: 'clients',
						localField: '_id',
						foreignField: '_id',
						as: 'client'
					}
				},
				{
					$limit: 10
				},
				{
					$sort: {
						total: -1,
						_id : 1 
					}
				}
			])

			return bestClients
		},
		getBestSellers: async () => {
			const bestSellers = await Order.aggregate([
				{
					$match: {
						state: "COMPLETED"
					}
				},
				{
					$group: {
						_id: '$seller',
						total: { $sum: '$total' }
					}
				},
				{
					$lookup: {
						from: 'users',
						localField: '_id',
						foreignField: '_id',
						as: 'seller'
					}
				},
				{
					$limit: 3
				},
				{
					$sort: {
						total: -1,
						_id : 1 
					}
				}
			])

			return bestSellers
		},
		searchProductByName: async (_, { text }) => {
			const products = await Product.find({ $text: { $search: text } })
			return products
		}
	},

	Mutation: {
		createUser: async (_, { input }) => {
			try {
				const { email, password } = input

				// * Check if the user is note registered
				const user = await User.findOne({ email })
				if (user) {
					throw new Error('The user is already registered')
				}

				// * Hash the password
				const salt = bcryptjs.genSaltSync(10)
				input.password = bcryptjs.hashSync(password, salt)

				// * Save it to DB
				const newUser = new User(input)
				const result = await newUser.save()
				return result
			} catch (error) {
				throw new Error(error.message)
			}
		},

		authenticateUser: async (_, { input }) => {
			try {
				const { email, password } = input

				// * Check if the user is note registered
				const user = await User.findOne({ email })
				if (!user) {
					throw new Error('The user does not exist')
				}

				// * Check if the password is correct
				const isCorrectPassword = bcryptjs.compareSync(password, user.password)
				if (!isCorrectPassword) {
					throw new Error('The password is not correct')
				}

				// * Generate the token
				return {
					token: generateToken(user, process.env.SECRET, '10h')
				}

			} catch (error) {
				throw new Error(error.message)
			}
		},



		createProduct: async (_, { input }) => {
			try {
				const { name } = input

				// * Check if the product exists
				const product = await Product.findOne({ name })
				if (product) {
					throw new Error('The product already exists')
				}

				// * Save it to the DB
				const newProduct = new Product(input)
				const result = await newProduct.save()
				return result
			} catch (error) {
				throw new Error(error.message)
			}
		},
		updateProduct: async (_, { id, input }) => {
			try {
				// * Check if the product exists
				const product = await Product.findById(id)
				if (!product) {
					throw new Error("The product does not exist")
				}
				// * Check if the product already exists
				const productExisted = await Product.findOne({ name: input.name })
				if (productExisted && id !== productExisted.id) {
					throw new Error('The product already exists')
				}

				// * Update it in the DB
				const updatedProduct = await Product.findOneAndUpdate({ _id: id }, input, { new: true }) // ? This is to return the updated register
				return updatedProduct
			} catch (error) {
				throw new Error(error.message)
			}
		},
		deleteProduct: async (_, { id }) => {
			try {
				// * Check if the product exists
				const product = await Product.findById(id)
				if (!product) {
					throw new Error("The product does not exist")
				}

				// * Delete it from the DB
				await Product.findOneAndDelete({ _id: id })
				return "Product successfully deleted"

			} catch (error) {
				throw new Error(error.message)
			}
		},


		createClient: async (_, { input }, ctx) => {
			try {
				const { user } = ctx

				const { email } = input
				// * Check if the client already exists
				const client = await Client.findOne({ email })
				if (client) {
					throw new Error("The client is already registered")
				}
				// * Asign it to a seller
				const newClient = new Client(input)
				newClient.seller = user.id
				// * Save it to the DB

				const result = await newClient.save()
				return result

			} catch (error) {
				throw new Error(error.message)
			}
		},
		updateClient: async (_, { id, input }, ctx) => {

			try {
				const { user } = ctx

				// * Check if the client exists
				const client = await Client.findById(id)
				if (!client) {
					throw new Error("The client does not exists")
				}

				// * Check if the seller assigned is the editor
				if (client.seller.toString() !== user.id) {
					throw new Error("You are not authorized to do this operation")
				}

				// * Update register in the DB
				const updatedClient = await Client.findOneAndUpdate({ _id: id }, input, { new: true })
				return updatedClient

			} catch (error) {
				throw new Error(error.message)
			}
		},
		deleteClient: async (_, { id }, ctx) => {
			try {
				const { user } = ctx

				// * Check if the client exists
				const client = await Client.findById(id)
				if (!client) {
					throw new Error("The client does not exists")
				}

				// * Check if the seller assigned is the deleter
				if (client.seller.toString() !== user.id) {
					throw new Error("You are not authorized to do this operation")
				}

				// * Delete register in the DB
				await Client.findOneAndDelete({ _id: id })
				return "Client successfully deleted"

			} catch (error) {
				throw new Error(error.message)
			}
		},



		createOrder: async (_, { input }, ctx) => {
			try {
				const { user } = ctx
				const { client } = input

				// * Check if the client exists
				const clientExists = await Client.findById(client)
				if (!clientExists) {
					throw new Error("The client does not exists")
				}

				// * Check if the client belongs to the seller
				if (clientExists.seller.toString() !== user.id) {
					throw new Error("You are not authorized to do this operation")
				}

				// * Check if the stock is available
				for await (const orderedProduct of input.order) {
					const { id } = orderedProduct
					const product = await Product.findById(id)

					if (orderedProduct.quantity > product.stock) {
						throw new Error(`The product: ${product.name} exceeds the available stock`)
					} else {
						// * Substract stock - quantity
						product.stock = product.stock - orderedProduct.quantity
						await product.save()
					}
				}

				// * Create a new Order
				const newOrder = new Order(input)

				// * Assign it to a seller
				newOrder.seller = user.id

				// * Save it to the DB
				const result = await newOrder.save()
				return result

			} catch (error) {
				throw new Error(error.message)
			}
		},
		updateOrder: async (_, { id, input }, ctx) => {
			try {
				const { user } = ctx
				const { client } = input

				// * Check if the order exists
				const oldOrder = await Order.findById(id)
				if (!oldOrder) {
					throw new Error("The order does not exists")
				}

				// * Check if the client exists
				const clientExists = await Client.findById(client)
				if (!clientExists) {
					throw new Error("The client does not exists")
				}

				// * Check if the client belongs to the seller
				if (clientExists.seller.toString() !== user.id) {
					throw new Error("You are not authorized to do this operation")
				}

				// * Check if the seller assigned is the editor
				if (oldOrder.seller.toString() !== user.id) {
					throw new Error("You are not authorized to do this operation")
				}

				// * Handle the stock
				if (input.order) {
					// ? First normalize the stock as if the order has never occured
					for await (const oldOrderedProduct of oldOrder.order) {
						const { id } = oldOrderedProduct
						const product = await Product.findById(id)
						product.stock = product.stock + oldOrderedProduct.quantity
						await product.save()
					}

					// ? Then proceed as normal
					for await (const orderedProduct of input.order) {
						const { id } = orderedProduct
						const product = await Product.findById(id)

						if (orderedProduct.quantity > product.stock) {
							throw new Error(`The product: ${product.name} exceeds the available stock`)
						} else {
							// * Substract stock - quantity
							product.stock = product.stock - orderedProduct.quantity
							await product.save()
						}
					}
				}

				// * Update register in the DB
				const updatedOrder = await Order.findOneAndUpdate({ _id: id }, input, { new: true })
				return updatedOrder

			} catch (error) {
				throw new Error(error.message)
			}
		},
		deleteOrder: async (_, { id }, ctx) => {
			try {
				const { user } = ctx

				// * Check if the order exists
				const order = await Order.findById(id)
				if (!order) {
					throw new Error("The order does not exists")
				}

				// * Check if the seller assigned is the editor
				if (order.seller.toString() !== user.id) {
					throw new Error("You are not authorized to do this operation")
				}

				// * Return stock to normality
				for await (const oldOrderedProduct of order.order) {
					const { id } = oldOrderedProduct
					const product = await Product.findById(id)
					product.stock = product.stock + oldOrderedProduct.quantity
					await product.save()
				}

				// * Delete register in the DB
				await Order.findOneAndDelete({ _id: id })
				return "Order successfully deleted"

			} catch (error) {
				throw new Error(error.message)
			}
		}
	}
}

module.exports = resolvers