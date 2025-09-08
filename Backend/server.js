// Load environment variables from the .env file at the very top
require("dotenv").config();

const app = require("./src/app");
const connectDb = require("./src/db/db");
const initSocketServer = require("./src/sockets/socket.server");
const httpServer = require("http").createServer(app);

// --- Main Application Logic ---

// 1. Initialize the Socket.IO server and attach it to the HTTP server.
initSocketServer(httpServer);

// 2. Connect to the MongoDB database.
// It's often better to connect to the DB before starting the server.
connectDb().then(() => {
    // 3. Start the HTTP server only after a successful database connection.
    httpServer.listen(3000, () => {
        console.log("✅ Server is running on port 3000");
    });
}).catch(err => {
    console.error("❌ Failed to connect to the database. Server will not start.", err);
    process.exit(1); // Exit the process with an error code
});
