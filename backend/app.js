require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require("./routes/users.routes");
const authRoutes = require("./routes/auth");
const courseRoutes = require('./routes/courses.routes');
const setupCors = require('./configs/cors.config');
const setupMiddleware = require('./configs/middleware.config');

const app = express();

// Middleware
setupMiddleware(app);
setupCors(app);

// Database connection
const mongoOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};
const mongoURI = process.env.MONGO_URI;

mongoose
    .connect(process.env.MONGO_URI, mongoOptions)
    .then(x => console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`))
    .catch(err => console.error('Error connecting to mongo', err));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);

// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = app;