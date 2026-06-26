const app = require("./src/app.js");
const connectDB = require("./src/config/db.js");
const express = require("express");
const authRoutes = require("./src/routes/auth.routes.js");

// const cors = require("cors");
require("dotenv").config();

const PORT = process.env.PORT || 5000;




connectDB();


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


