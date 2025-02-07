import { io, Socket } from 'socket.io-client';

const apiUrl = import.meta.env.VITE_PROD_API_URL;
// const apiUrl = import.meta.env.VITE_DEV_API_URL;
// const apiUrl = import.meta.env.VITE_TESTING_API_URL; //url for testing

const SOCKET_URL = apiUrl; // Server URL
const socket: Socket = io(SOCKET_URL); //Establishes WebSocket connection with the server

export default socket;