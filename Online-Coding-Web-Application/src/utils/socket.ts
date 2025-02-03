import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000'; // Replace with your server URL
const socket: Socket = io(SOCKET_URL);

export default socket;