const { Server } = require('socket.io');
const express = require('express');
const http = require('http');
const cors = require('cors');
const Redis = require('ioredis');
const { onlineUsers, waitingQueue } = require('./store');
const cookieParser = require('cookie-parser');

const app = express();
const server = http.createServer(app);

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"]
}));
app.use(cookieParser());
app.use(express.json());

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    },
});

// Redis Subscriber for Worker Updates
const redisSubscriber = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || '',
    maxRetriesPerRequest: null,
});
redisSubscriber.on('error', (err) => {
  console.error('Main Server Redis Error:', err.message);
});
redisSubscriber.subscribe('code-updates', (err, count) => {
    if (err) console.error("Failed to subscribe: %s", err.message);
    else console.log(`Subscribed to ${count} Redis channel(s).`);
});

redisSubscriber.on('message', (channel, message) => {
    if (channel === 'code-updates') {
        try {
            const { userId, event, data } = JSON.parse(message);
            const socketId = onlineUsers.get(userId);
            if (socketId) {
                io.to(socketId).emit(event, data);
                console.log(`Relayed ${event} to user ${userId}`);
            }
        } catch (error) {
            console.error("Error processing Redis message:", error);
        }
    }
});

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    io.emit('onlineUsers', io.engine.clientsCount);

    socket.on("login", (userId) => {
        socket.userId = userId; 
        onlineUsers.set(userId, socket.id);
        io.emit('onlineUsers', io.engine.clientsCount);
    });

    socket.on("cancelMatch",(userId)=>{
        waitingQueue.delete(socket.id);
    })

    socket.on("logout", (userId) => {
        onlineUsers.delete(userId);
        waitingQueue.delete(socket.id);
        io.emit('onlineUsers', io.engine.clientsCount);
    });

    socket.on("disconnect", () => {
        waitingQueue.delete(socket.id);
        io.emit('onlineUsers', io.engine.clientsCount);
        if (socket.userId) {
            if (onlineUsers.get(socket.userId) === socket.id) {
                onlineUsers.delete(socket.userId);
            }
        }
    });
});

module.exports = { app, server, io, onlineUsers };