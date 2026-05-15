import { Server } from 'socket.io';
let io;
export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:5173',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);
        socket.on('join', (userId) => {
            socket.join(userId);
            console.log(`User ${userId} joined their personal room`);
        });
        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
    return io;
};
export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};
export const emitNotification = (userId, data) => {
    if (io) {
        io.to(userId).emit('notification', data);
    }
};
export const emitToAll = (event, data) => {
    if (io) {
        io.emit(event, data);
    }
};
//# sourceMappingURL=socket.js.map