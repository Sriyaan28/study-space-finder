const { handleAIChat } = require('../services/aiService');

// @desc    Chat with AI Study Space Assistant
// @route   POST /api/ai/chat
// @access  Public (Can optionally use auth)
const chatWithAI = async (req, res, next) => {
  try {
    const { query, history } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide a message or question.' });
    }

    const response = await handleAIChat(query, history || []);

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { chatWithAI };
