const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const aiService = require("../services/ai.service");
const messageModel = require("../models/message.model");
const { createMemory, queryMemory } = require("../services/vector.service");

function initSocketServer(httpServer) {

    const io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true
        }
    });

    // --- Authentication Middleware ---
    io.use(async (socket, next) => {
        try {
            const cookies = cookie.parse(socket.handshake.headers?.cookie || "");
            const token = cookies.token;

            if (!token) {
                return next(new Error("Authentication error: No token provided"));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            if (!decoded.userId) {
                return next(new Error("Authentication error: Invalid token payload"));
            }
            
            const user = await userModel.findById(decoded.userId).lean();

            if (!user) {
                return next(new Error("Authentication error: User not found."));
            }

            socket.user = user;
            next();

        } catch (err) {
            console.error("Socket Auth Error:", err.message);
            next(new Error("Authentication error: Invalid token"));
        }
    });

    io.on("connection", (socket) => {
        console.log(`✅ User connected: ${socket.id}, UserID: ${socket.user?._id}`);

        socket.on("ai-message", async (payload) => {
            try {
                // --- THIS IS THE FIX ---
                // 1. Log the incoming payload to see its type and content.
                console.log("Received ai-message payload:", payload);
                console.log("Type of payload:", typeof payload);

                let messagePayload = payload;

                // 2. If the payload is a string, parse it into a JSON object.
                if (typeof payload === 'string') {
                    try {
                        messagePayload = JSON.parse(payload);
                    } catch (e) {
                        console.error("Failed to parse payload string:", e);
                        return socket.emit("ai-error", { message: "Invalid message format." });
                    }
                }
                // --- END OF FIX ---


                if (!socket.user || !socket.user._id) {
                    return socket.emit("ai-error", { message: "Authentication error, please reconnect." });
                }

                const userId = socket.user._id;

                let message;
                // If this is an edit of an existing message, update it instead of creating a new one
                if (messagePayload.messageId) {
                    message = await messageModel.findOneAndUpdate(
                        { _id: messagePayload.messageId, user: userId },
                        { content: messagePayload.content },
                        { new: true }
                    );
                    // If update fails (message not found), fall back to creating a new message
                    if (!message) {
                        message = await messageModel.create({ chat: messagePayload.chat, user: userId, content: messagePayload.content, role: 'user' });
                    }
                } else {
                    message = await messageModel.create({ chat: messagePayload.chat, user: userId, content: messagePayload.content, role: 'user' });
                }

                const vectors = await aiService.generateVector(messagePayload.content);
                
                // ... (rest of the code is the same)

                await createMemory({
                    vectors,
                    messageId: message._id,
                    metadata: {
                        chat: messagePayload.chat,
                        user: userId.toString(),
                        text: messagePayload.content
                    }
                });

                const [memory, chatHistory] = await Promise.all([
                    queryMemory({
                        queryVector: vectors,
                        limit: 3,
                        metadata: { user: userId.toString() }
                    }),
                    messageModel.find({
                        chat: messagePayload.chat
                    }).sort({ createdAt: -1 }).limit(20).lean().then(messages => messages.reverse())
                ]);
                
                const conversationPayload = chatHistory.map(item => ({
                    role: item.role,
                    parts: [{ text: item.content }]
                }));

                const ltmContext = memory.map(item => item.metadata.text).join("\n");

                if (ltmContext.trim() && conversationPayload.length > 0) {
                    const lastMessageIndex = conversationPayload.length - 1;
                    const lastMessage = conversationPayload[lastMessageIndex];
                    const originalText = lastMessage.parts[0].text;
                    const contextPrefix = `Use this context from our past conversations to help you answer:\n---\nCONTEXT:\n${ltmContext}\n---\n\nPROMPT: `;
                    lastMessage.parts[0].text = contextPrefix + originalText;
                }

                const response = await aiService.generateResponse(conversationPayload);

                socket.emit('ai-response', {
                    content: response,
                    chat: messagePayload.chat
                });

                const [responseMessage, responseVectors] = await Promise.all([
                    messageModel.create({
                        chat: messagePayload.chat,
                        user: userId,
                        content: response,
                        role: "model"
                    }),
                    aiService.generateVector(response)
                ]);

                await createMemory({
                    vectors: responseVectors,
                    messageId: responseMessage._id,
                    metadata: {
                        chat: messagePayload.chat,
                        user: userId.toString(),
                        text: response
                    }
                });

            } catch (error) {
                // Use console.warn for non-critical server errors
                console.warn("Error in ai-message event:", error);
                socket.emit("ai-error", { message: "An internal server error occurred." });
            }
        });

        socket.on('disconnect', () => {
            console.log(`🔌 User disconnected: ${socket.id}`);
        });
    });
}

module.exports = initSocketServer;

