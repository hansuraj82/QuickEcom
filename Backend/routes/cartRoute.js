const express = require('express');
const auth = require('../middlewares/auth');
const Cart = require('../models/cart.model');
const Item = require('../models/items.model');
const router = express.Router();


// get cart for logged in user
router.get('/', auth, async (req,res)=>{
try{
let cart = await Cart.findOne({ user: req.userId }).populate('items.item');
if(!cart) cart = await Cart.create({ user: req.userId, items: [] });
res.json(cart);

}catch(err){ 
    res.status(500).json({ message: err.message }); 
}
});


// add/replace items - body: { items: [{ itemId, qty }] }
router.post('/', auth, async (req,res)=>{
try{
const { items } = req.body; // items array
let cart = await Cart.findOne({ user: req.userId });
if(!cart){ cart = new Cart({ user: req.userId, items: [] }); }
// replace with provided items (simple approach)
cart.items = [];
for(const it of items){
const found = await Item.findById(it.itemId);
if(found) cart.items.push({ item: found._id, qty: Number(it.qty) || 1 });
}
await cart.save();
await cart.populate('items.item');
res.json(cart);
}catch(err){ 
    res.status(500).json({ message: err.message }); 
}
});


// remove single item
router.delete('/:itemId', auth, async (req,res)=>{
try{
let cart = await Cart.findOne({ user: req.userId });
if(!cart) return res.status(404).json({ message: 'No cart' });
cart.items = cart.items.filter(x => x.item.toString() !== req.params.itemId);
await cart.save();
await cart.populate('items.item');
res.json(cart);
}catch(err){
     res.status(500).json({ message: err.message }); 
    }
});


module.exports = router;