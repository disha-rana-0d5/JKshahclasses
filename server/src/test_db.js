const mongoose = require('mongoose');
const Order = require('./models/Order');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to DB');
    const order = await Order.findOne().sort({createdAt: -1});
    console.log(JSON.stringify(order, null, 2));
    process.exit(0);
  });
