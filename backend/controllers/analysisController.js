const pool = require('../config/db');

exports.getSummary = async (req, res) => {
    const userId = req.session.userId;
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    try {
        // Current month total
        const [currentTotalRow] = await pool.query(
            'SELECT SUM(amount) as total FROM expenses WHERE user_id = ? AND MONTH(expense_date) = ? AND YEAR(expense_date) = ?',
            [userId, currentMonth, currentYear]
        );
        const currentTotal = currentTotalRow[0].total || 0;

        // Previous month total
        const [prevTotalRow] = await pool.query(
            'SELECT SUM(amount) as total FROM expenses WHERE user_id = ? AND MONTH(expense_date) = ? AND YEAR(expense_date) = ?',
            [userId, prevMonth, prevYear]
        );
        const prevTotal = prevTotalRow[0].total || 0;

        // Category-wise totals (Current Month)
        const [categoryTotals] = await pool.query(
            `SELECT c.name, SUM(e.amount) as total 
             FROM expenses e 
             JOIN categories c ON e.category_id = c.id 
             WHERE e.user_id = ? AND MONTH(e.expense_date) = ? AND YEAR(e.expense_date) = ? 
             GROUP BY c.id`,
            [userId, currentMonth, currentYear]
        );

        // Highest spending category
        const highestCategory = categoryTotals.length > 0
            ? categoryTotals.reduce((prev, current) => (prev.total > current.total) ? prev : current)
            : null;

        // Insights
        let insight = "";
        if (prevTotal > 0) {
            const diff = ((currentTotal - prevTotal) / prevTotal) * 100;
            insight = `You spent ${Math.abs(diff).toFixed(1)}% ${diff > 0 ? 'more' : 'less'} than last month.`;
        } else {
            insight = "Keep tracking to see monthly comparisons!";
        }

        res.json({
            currentTotal,
            prevTotal,
            categoryTotals,
            highestCategory,
            insight
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getTrends = async (req, res) => {
    const userId = req.session.userId;
    try {
        const [rows] = await pool.query(
            `SELECT MONTH(expense_date) as month, YEAR(expense_date) as year, SUM(amount) as total 
             FROM expenses 
             WHERE user_id = ? 
             GROUP BY YEAR(expense_date), MONTH(expense_date) 
             ORDER BY year ASC, month ASC 
             LIMIT 60`,
            [userId]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getPrediction = async (req, res) => {
    const userId = req.session.userId;
    try {
        // 1. Get historical data (last 12 months)
        const [rows] = await pool.query(
            `SELECT MONTH(expense_date) as month, YEAR(expense_date) as year, SUM(amount) as total 
             FROM expenses 
             WHERE user_id = ? 
             GROUP BY YEAR(expense_date), MONTH(expense_date) 
             ORDER BY year ASC, month ASC 
             LIMIT 60`,
            [userId]
        );

        if (rows.length === 0) {
            return res.json({ nextMonthPrediction: 0, insight: "No data available yet." });
        }

        // 2. Call ML Python Service
        // Using dynamic import for node-fetch or using built-in fetch if available (Node 18+)
        const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:5001/predict';

        const response = await fetch(mlServiceUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ historical: rows })
        });

        if (!response.ok) {
            throw new Error('ML Service failed');
        }

        const predictionData = await response.json();

        // 3. Map all fields from ML service (including new range and model info)
        res.json({
            nextMonthPrediction: predictionData.prediction,
            confidence: predictionData.confidence,
            insight: predictionData.insight,
            forecast: predictionData.forecast,
            range: predictionData.range,
            model_used: predictionData.model_used
        });

    } catch (error) {
        console.error('ML Error:', error.message);
        res.status(500).json({ message: 'Forecasting error', error: error.message });
    }
};
