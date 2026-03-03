const express = require('express');
const session = require('express-session');
const cors = require('cors');
const dotenv = require('dotenv');
const initDb = require('./config/initDb');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // set to true if using https
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));

// Routes (to be added)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/analysis', require('./routes/analysisRoutes'));
app.use('/api/budgets', require('./routes/budgetRoutes'));
app.use('/api/family', require('./routes/familyRoutes'));

// Database Initialization
initDb().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
