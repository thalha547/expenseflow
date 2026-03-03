const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const pool = require('./config/db');

async function seedHistoricalData() {
    try {
        // 1. Get or Create a User
        let [users] = await pool.query('SELECT id FROM users LIMIT 1');
        let userId;

        if (users.length === 0) {
            console.log('--- No user found, creating a dummy user "ml_trainer" ---');
            await pool.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                ['ml_trainer', 'ml@example.com', '$2a$10$X8O9jB8.yBfP8GfR8g8v8.G']); // password: password
            const [newUsers] = await pool.query('SELECT id FROM users LIMIT 1');
            userId = newUsers[0].id;
        } else {
            userId = users[0].id;
        }

        console.log(`🚀 Seeding 5 YEARS of training data for User ID: ${userId}...`);

        // 2. Clear old simulated data
        await pool.query('DELETE FROM expenses WHERE user_id = ? AND notes LIKE "Simulated%"', [userId]);

        // 3. Get Categories
        let catIds;
        const [categories] = await pool.query('SELECT id FROM categories LIMIT 5');
        if (categories.length === 0) {
            console.log('--- No categories found, seeding defaults ---');
            await pool.query("INSERT INTO categories (name, is_preset) VALUES ('Food', 1), ('Bills', 1), ('Transport', 1)");
            const [newCats] = await pool.query('SELECT id FROM categories LIMIT 5');
            catIds = newCats.map(c => c.id);
        } else {
            catIds = categories.map(c => c.id);
        }

        const now = new Date();
        const paymentModes = ['Cash', 'UPI', 'Card', 'Bank Transfer'];

        // 4. Generate 60 months (5 years) 
        for (let m = 0; m < 60; m++) {
            const date = new Date(now.getFullYear(), now.getMonth() - m, 15);

            // Pattern: Inflation + Increasing Trend + Annual Seasonality
            const yearIndex = Math.floor(m / 12);
            const inflation = yearIndex * 2000;
            const trend = (60 - m) * 100;
            const season = 4000 * Math.sin((m * Math.PI) / 6);
            const baseline = 20000 + inflation + trend + season;

            const numExpenses = 6 + Math.floor(Math.random() * 4);
            for (let i = 0; i < numExpenses; i++) {
                const amount = (baseline / numExpenses) + (Math.random() * 800 - 400);
                const catId = catIds[Math.floor(Math.random() * catIds.length)];
                const day = Math.floor(Math.random() * 28) + 1;
                const expenseDate = new Date(date.getFullYear(), date.getMonth(), day);
                const mode = paymentModes[Math.floor(Math.random() * paymentModes.length)];

                await pool.query(
                    'INSERT INTO expenses (user_id, category_id, amount, expense_date, payment_mode, notes) VALUES (?, ?, ?, ?, ?, ?)',
                    [userId, catId, Math.max(10, amount), expenseDate, mode, `Simulated Expense Vol_${m}_${i}`]
                );
            }
            if (m % 12 === 0) console.log(`... Processing Year ${5 - yearIndex}`);
        }

        console.log('✅ Success! ML Training Data (5 Years) injected into the database.');
    } catch (err) {
        console.error('❌ Seeding failed:', err.message);
    }
}

seedHistoricalData()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
