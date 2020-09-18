const User = require('../models/User')
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
		getAuthenticatedUser: (_, { token }) => {
			const userId = jwt.verify(token, process.env.SECRET)
			return userId
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
				await newUser.save()

				return newUser
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
					token: generateToken(user, process.env.SECRET, 3600 * 12)
				}

			} catch (error) {
				throw new Error(error.message)
			}
		}
	}
}

module.exports = resolvers