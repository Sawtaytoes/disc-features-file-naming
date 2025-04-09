import pty from "@lydell/node-pty" // TODO: Potentially change this to node-pty for Linux and install from `Dockerfile`.
import express from "express"
import http from "node:http"
import os from "node:os"
import path from "node:path"
import { Server } from "socket.io"

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from the 'public' directory
app.use(express.static(path.join(import.meta.dirname, "..", 'public')));

io.on('connection', (socket) => {
  console.log('A user connected');

  // Determine the shell based on the operating system
  const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

  // Spawn a new pseudo-terminal
  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.env.HOME,
    env: process.env,
  });

  // Relay data from the terminal to the client
  ptyProcess.on('data', (data) => {
    socket.emit('output', data);
  });

  // Relay data from the client to the terminal
  socket.on('input', (input) => {
    ptyProcess.write(input);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    ptyProcess.kill();
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
