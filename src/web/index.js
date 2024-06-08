const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const { Server } = require('http');
const record = require('node-record-lpcm16');

const app = express();
const server = Server(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000;

// Serve static files from the "public" directory
app.use(express.static('public'));

// WebSocket connection
io.on('connection', (socket) => {
  console.log('A user connected');

  // Start capturing microphone data when a user connects
  const audioStream = record.start({
    sampleRateHertz: 16000,
    threshold: 0, // Silence threshold
    verbose: false,
    recordProgram: 'rec', // Try also "arecord" or "sox"
  });

  // Forward audio data to the client
  audioStream.on('data', (chunk) => {
    socket.emit('audioData', chunk);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected');
    record.stop();
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
