const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
/* Importing Routes */
const authRoutes = require('./routes/auth.routes');
const chatRoutes = require('./routes/chat.routes');

const app = express();

/* Middlewares */
app.use(express.json());
app.use(cookieParser());

// FIX: Updated CORS configuration
app.use(cors({
    origin: 'http://localhost:5173', // Allow requests from your React client
    credentials: true                  // Allow cookies to be sent
}));

/* Using Routes */
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

module.exports = app;