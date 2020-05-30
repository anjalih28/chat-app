const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");

const app = express();
// The following is done by express behind the scenes.
// But we are explicitly doing it to pass it to socket.io
const server = http.createServer(app);
// socket.io has to be called with an http server
const io = socketio(server);

const publicDirPath = path.join(__dirname, "../public");
const port = process.env.port || 3000;

// Setup static directory to serve
app.use(express.static(publicDirPath));

// let count = 0;

// server (emits) - client (receives) ==> countUpdated
// client (emits) - server (receives) ==> increment

io.on("connection", (socket) => {
  console.log("New websocket connection");

  socket.on("join", ({ username, room }, cb) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
      return cb(error);
    }

    socket.join(user.room);

    socket.emit(
      "message",
      generateMessage("Admin", `Welcome, ${user.username}`)
    );
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage("Admin", `${user.username} has joined!`)
      );
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    cb();
  });

  socket.on("sendMessage", (clientMessage, cb) => {
    const filter = new Filter();

    if (filter.isProfane(clientMessage)) {
      return cb("Profanity is not allowed!");
    }

    const user = getUser(socket.id);

    io.to(user.room).emit(
      "message",
      generateMessage(user.username, clientMessage)
    );

    cb();
  });

  socket.on("sendLocation", (clientLocation, cb) => {
    const user = getUser(socket.id);

    const url = `https://google.com/maps?q=${clientLocation.lat},${clientLocation.lon}`;

    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(user.username, url)
    );

    cb();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage("Admin", `${user.username} has left`)
      );

      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log(`Server up at port ${port}`);
});
