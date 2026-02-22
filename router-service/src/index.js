require('dotenv').config();
const express = require('express');
const { handleIncomingMessage } = require('./router');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Sofi Router Service Area 51');
});

app.post('/incoming', async (req, res) => {
    try {
        const result = await handleIncomingMessage(req.body);
        res.json(result);
    } catch (error) {
        console.error('Error processing message:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Router Service running on port ${PORT}`);
});
