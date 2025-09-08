const mongoose = require('mongoose');


const CartSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        unique: true
    },
    items: [
        {
            item: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Item'
            },

            qty: {
                type: Number,
                default: 1
            }
        }
    ]

});

const Cart = mongoose.model('Cart', CartSchema);
module.exports = Cart;
