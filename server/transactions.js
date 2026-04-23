import express from "express";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import { Server } from "socket.io";


dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());

io.on("connection", (socket) => {
  socket.emit("connection", { socketId: socket.id });
  console.log("A user connected with socket ID:", socket.id);

  
  socket.on("register", (walletAddress) => {
    socket.join(walletAddress); // wallet address = room
    console.log(`${walletAddress} joined their room`);
  });

  socket.on("buy_request", (data) => {
    console.log("Buy request received:", data);
  io.to(data.farmer).emit("new_request", data);
});

socket.on("accept_request", (data) => {
  io.to(data.buyer).emit("accept_request", data);
});

socket.on("payment_success", (data) => {
  io.to(data.farmer).emit("payment_success", data);
});


});
app.get("/", (req, res) => {
  res.send("Hello World!");
});

server.listen(process.env.PORT || 5000, () => {
  console.log(`Server is running on port ${process.env.PORT || 5000}`);
});