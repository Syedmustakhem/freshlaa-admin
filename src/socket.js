import { io } from "socket.io-client";

const socket = io("https://api.freshlaa.com", {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export default socket;
