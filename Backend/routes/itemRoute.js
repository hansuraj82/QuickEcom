const express = require('express');
const Item = require('../models/items.model');
const router = express.Router();


// create item (admin would use this)
router.post('/', async (req, res) => {
    try {
        const response = await Item.create(req.body);
        res.json(response);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// list with filters: ?q=&category=&min=&max=&sort=price_asc
router.get('/', async (req, res) => {
  try {
    const { q, category, min, max, sort, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (q) filter.title = { $regex: q, $options: 'i' };

    if (category) {
      filter.category = { $regex: category, $options: 'i' };
    }

    if (min || max) filter.price = {};
    if (min) filter.price.$gte = Number(min);
    if (max) filter.price.$lte = Number(max);

    let query = Item.find(filter);

    if (sort === 'price_asc') query = query.sort({ price: 1 });
    if (sort === 'price_desc') query = query.sort({ price: -1 });

    const skip = (page - 1) * limit;
    const items = await query.skip(skip).limit(Number(limit));

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// single item
// router.get('/:id', async (req, res) => {
//     try {
//         const foundItem = await Item.findById(req.params.id);
//         res.json(foundItem);
//     }
//     catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});


// update
router.put('/:id', async (req, res) => {
    try {
        const foundItem = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(foundItem);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// delete
router.delete('/:id', async (req, res) => {
    try {
        await Item.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;