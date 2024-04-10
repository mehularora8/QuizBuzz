const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
    },
});

// Store buzzes for each room
const roomBuzzes = {};

io.on('connection', (socket) => {
    socket.on('joinRoom', ({ room, name }) => {
        console.log('Client connected:', socket.id, 'Room:', room);
        if (!roomBuzzes[room]) {
            console.log('Creating room:', room);
            roomBuzzes[room] = [];
        }

        // 8 contestants + 1 admin
        if (roomBuzzes[room].length < 9) {
            console.log("Joining room:", room, "Name:", name)
            socket.join(room);
            socket.emit('buzzUpdate', roomBuzzes[room]); // Send current state of the room
        }
    });

    socket.on('buzz', ({ room, time, name }) => {
        const buzz = { id: socket.id, time: time, name: name };

        // Check if same contestant has already buzzed
        if (roomBuzzes[room].find((b) => b.id === buzz.id)) {
            return;
        }

        if (roomBuzzes[room].length < 8) {
            roomBuzzes[room].push(buzz);
            roomBuzzes[room].sort((a, b) => new Date(a.time) - new Date(b.time));
            io.to(room).emit('buzzUpdate', roomBuzzes[room]);
        }
    });

    socket.on('reset', (room) => {
        // TODO: Should only be an admin thing. Add admin check.
        roomBuzzes[room] = [];
        io.to(room).emit('buzzUpdate', roomBuzzes[room]);
    });

    socket.on('leaveRoom', (room) => {
        socket.leave(room);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

server.listen(4000, () => {
    console.log('Listening on port 4000');
});