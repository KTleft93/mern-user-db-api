const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const https = require('https');
const { connectDB } = require('./db');
const authRoutes = require('./routes/auth');

const app = express();
connectDB();

// SSL Certificates 
const privateKey = fs.readFileSync(process.env.PRIVATE_KEY_PATH, 'utf8');
const certificate = fs.readFileSync(process.env.CERTIFICATE_PATH, 'utf8');


const credentials = { key: privateKey, cert: certificate, passphrase: process.env.PASSPHRASE };

app.use(bodyParser.json());

app.use('/api/auth', authRoutes);

const httpsServer = https.createServer(credentials, app);

// Start the server on port 3000 (HTTPS)
httpsServer.listen(process.env.PORT, () => {
    console.log('HTTPS Server running on '+ process.env.PORT);
});
