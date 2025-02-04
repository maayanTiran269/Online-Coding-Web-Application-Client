import { io, Socket } from 'socket.io-client';
const apiUrl = import.meta.env.VITE_DEV_API_URL;

const SOCKET_URL = apiUrl; // Replace with your server URL
const socket: Socket = io(SOCKET_URL);

export default socket;