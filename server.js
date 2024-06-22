const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const PORT = process.env.PORT || 3000;
const app = express();

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(__dirname + '/public'));

wss.on('connection', (ws) => {
    console.log('A new client connected');

    const welcomeMessage = {
        user: 'Server',
        text: 'Welcome to the chat!'
    };
    ws.send('welcome');


    ws.on('message', (message) => {
        console.log(`Received message => ${message}`);
        // Broadcast the message to all clients
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message.toString());
                //io.to(roomId).emit('gameEnd', { winner, choices: room.choices });
            }
        });
    });

    ws.on('close', () => {
        console.log('A client disconnected');
    });
});

server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
