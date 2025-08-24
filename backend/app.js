require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require("./routes/users.routes");
const authRoutes = require("./routes/auth");
const courseRoutes = require('./routes/courses.routes');
const adminRoutes = require('./routes/index');
const setupCors = require('./configs/cors.config');
const setupMiddleware = require('./configs/middleware.config');

const app = express();

// Seed a default admin user if none exists
const User = require('./models/user.model');
async function seedAdmin() {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@nexted.local';
        const existing = await User.findOne({ email: adminEmail });
        if (!existing) {
            const bcrypt = require('bcrypt');
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin123!', salt);
            const admin = new User({
                firstName: 'Admin',
                lastName: 'User',
                email: adminEmail,
                password: passwordHash,
                role: 'admin',
                approved: true,
                status: 'approved'
            });
            await admin.save();
            console.log('Seeded default admin:', adminEmail);
        }
    } catch (e) {
        console.error('Admin seeding failed:', e.message);
    }
}

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
    .then(async x => {
        console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`);
        await seedAdmin();
    })
    .catch(err => console.error('Error connecting to mongo', err));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/admin", adminRoutes);

// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = app;