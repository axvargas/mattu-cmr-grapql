const mongoose = require('mongoose')
const { Schema } = mongoose

const OrderSchema = new Schema({
    order: {
        type: Array,
        required: true,
    },
    total: {
        type: Number,
        required: true,
        trim: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Client'
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    state: {
        type: String,
        default: "PENDING"
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model('Order', OrderSchema)