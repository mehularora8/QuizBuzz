import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:4000');

function App() {
    const [room, setRoom] = useState('');
    const [name, setName] = useState('');
    const [currentRoom, setCurrentRoom] = useState('');
    const [buzzes, setBuzzes] = useState([]);

    useEffect(() => {
        socket.on('buzzUpdate', setBuzzes);
        return () => socket.off('buzzUpdate');
    }, []);

    const joinRoom = () => {
        if (room !== '') {
            socket.emit('joinRoom', { room, name });
            setCurrentRoom(room);
            setRoom(''); // Optionally clear the room input after joining
        }
    };

    const handleBuzz = () => {
        socket.emit('buzz', { room: currentRoom, time: new Date().toISOString(), name: name });
    };

    const handleReset = () => {
        socket.emit('reset', currentRoom);
    };

    const handleLeaveRoom = () => {
        socket.emit('leaveRoom', currentRoom);
        setCurrentRoom('');
        setBuzzes([]);
    };

    return (
        <div>
            <h1>Buzzer System</h1>
            {!currentRoom && (
                <div>
                    <input
                        type="text"
                        value={room}
                        onChange={e => setRoom(e.target.value)}
                        required
                        placeholder="Enter room code"
                    />
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                        placeholder="Enter Name"
                    />
                    <button onClick={joinRoom}>Join Room</button>
                </div>
            )}
            {currentRoom && (
                <div>
                    <h2>Room: {currentRoom}</h2>
                    <button onClick={handleBuzz}>Buzz</button>
                    <button onClick={handleReset}>Reset</button>
                    <button onClick={handleLeaveRoom}>Leave Room</button>
                    <ul>
                        {buzzes.map((buzz, index) => (
                            <li key={index}>By {buzz.name} at {buzz.time}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default App;