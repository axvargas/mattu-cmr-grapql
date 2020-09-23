const mongoose = require('mongoose')
const { Schema } = mongoose

const ProductSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    stock: {
        type: Number,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
})

ProductSchema.index({ name: 'text'})    // ? This is to make if findable

module.exports = mongoose.model('Product', ProductSchema)