import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'https://online-coding-web-application-server.onrender.com/api/code-blocks'; // Replace with your server URL
const socket: Socket = io(SOCKET_URL);

export default socket;