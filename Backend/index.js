const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();


const userRoutes = require('./routes/userRoute');
const itemsRoutes = require('./routes/itemRoute');
const cartRoutes = require('./routes/cartRoute');


const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/v1/main',(req,res) => {
    res.status(200).json({msg: "hey there everyone"});
})
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/items', itemsRoutes);
app.use('/api/v1/cart', cartRoutes);


const PORT = process.env.PORT || 3001;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(()=>{
app.listen(PORT, ()=> console.log('Server running on', PORT));
})
.catch(err=> console.error(err));