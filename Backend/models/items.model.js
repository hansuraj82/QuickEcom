const mongoose = require('mongoose');


const ItemSchema = new mongoose.Schema({

    title: String,

    description: String,

    price: Number,

    category: String,

    image: String,

    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Item = mongoose.model('Item', ItemSchema);
module.exports = Item;