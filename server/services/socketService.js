const { Server } = require('socket.io');

let waitingUser = null;
let io;
const gameSockets = {}; 

const initSocketServer = (server) => {
    io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);
        io.emit('activeUsersUpdate', io.engine.clientsCount);

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
            io.emit('activeUsersUpdate', io.engine.clientsCount);
            if (waitingUser && waitingUser.socketId === socket.id) {
                waitingUser = null;
            }
        });

        socket.on('joinQueue', (data) => {
            if (waitingUser) {
                const opponentSocket = io.sockets.sockets.get(waitingUser.socketId);
                const gameId = waitingUser.gameId;

                socket.emit('matchFound', { gameId, opponentId: waitingUser.userId });
                if (opponentSocket) {
                    opponentSocket.emit('matchFound', { gameId, opponentId: data.userId });
                }

                gameSockets[gameId] = {
                    player1: waitingUser.socketId,
                    player2: socket.id
                };
                
                waitingUser = null;
            } else {
                waitingUser = { 
                    socketId: socket.id, 
                    userId: data.userId, 
                    gameId: data.gameId
                };
                socket.emit('waitingForOpponent', { message: 'Waiting for an opponent...' });
            }
        });

        socket.on('submissionStatus', (data) => {
            const { gameId, userId, status } = data;
            const sockets = gameSockets[gameId];

            if (sockets) {
                const opponentSocketId = sockets.player1 === socket.id ? sockets.player2 : sockets.player1;
                const opponentSocket = io.sockets.sockets.get(opponentSocketId);
                
                if (opponentSocket) {
                    opponentSocket.emit('opponentSubmitted', { userId, status });
                }
            }
        });
    });
};

module.exports = { initSocketServer };