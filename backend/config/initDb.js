const pool = require('./db');

async function initDb() {
    try {
        // Users table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Categories table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        user_id INT,
        is_preset BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_category_per_user (name, user_id)
      )
    `);

        // Expenses table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        category_id INT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        expense_date DATE NOT NULL,
        payment_mode ENUM('Cash', 'UPI', 'Card', 'Bank Transfer') NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      )
    `);

        // Budgets table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS budgets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        category_id INT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        month INT NOT NULL,
        year INT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
        UNIQUE KEY unique_budget (user_id, category_id, month, year)
      )
    `);

        console.log('Database initialized successfully');

        // Seed default categories
        const [existing] = await pool.query('SELECT COUNT(*) as count FROM categories WHERE is_preset = TRUE');
        if (existing[0].count === 0) {
            const defaultCategories = [
                ['Groceries', null, true],
                ['Medical', null, true],
                ['Rent', null, true],
                ['Utilities', null, true],
                ['Transportation', null, true],
                ['Taxes', null, true],
                ['Entertainment', null, true]
            ];
            await pool.query('INSERT INTO categories (name, user_id, is_preset) VALUES ?', [defaultCategories]);
            console.log('Default categories seeded');
        }

    } catch (error) {
        if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('Database does not exist. Please create it manually.');
        } else {
            console.error('Error initializing database:', error);
        }
    }
}

module.exports = initDb;
