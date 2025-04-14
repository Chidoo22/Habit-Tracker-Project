const express = require('express');
const authMiddleware = require('../middleware/auth');
const {
    getStreak,
    incrementStreak,
    resetStreak
} = require('../models/streaks');

const router = express.Router();


router.get('/', authMiddleware, async (req, res) => {
    try {
        const streak = await getStreak(req.user.id);
        res.json(streak);
    } catch (error) {
        console.error("Error getting streak:", error);
        res.status(500).json({ message: 'Server error while fetching streak' });
    }
});

router.post('/increment', authMiddleware, async (req, res) => {
    try {
        const updatedStreak = await incrementStreak(req.user.id);
        res.json(updatedStreak);
    } catch (error) {
        console.error("Error incrementing streak:", error);
        res.status(500).json({ message: 'Server error while incrementing streak' });
    }
});


router.post('/reset', authMiddleware, async (req, res) => {
    try {
        const reset = await resetStreak(req.user.id);
        res.json(reset);
    } catch (error) {
        console.error("Error resetting streak:", error);
        res.status(500).json({ message: 'Server error while resetting streak' });
    }
});

module.exports = router;
