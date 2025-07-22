require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
require('./config/db');
const axios = require("axios");
 

const storeRoutes   = require('./routes/store/auth/authRoutes');
const storeProfileRoutes   = require('./routes/store/profile/profileRoutes');
const storeCustomerRoutes   = require('./routes/store/customer/customerRoutes');

// const userRoutes   = require('./routes/userRoutes');
// const storeRoutes   = require('./routes/storeRoutes');

// const moment = require('moment-timezone');





const app = express();
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.json());

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error(err);
    return res.status(400).send({ message: "Malformed JSON in request body" });
  }
  next();
});


app.get("/", (req, res) => res.send("Express on Vercel"));

 

// Load Routes
app.use(storeRoutes)
app.use(storeProfileRoutes)
app.use(storeCustomerRoutes)


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));