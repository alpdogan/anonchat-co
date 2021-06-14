const express = require("express");
const http = require("http");
const app = new express();
const server = http.createServer(app);
const io = require("socket.io")(server);
const path = require("path");

const { pairedUser } = require("./db");

const PORT = process.env.PORT || 5000;
const priorityQueue = [];
let userCount = 0;
let pairCount = 0;
const sockets = {};
var timer;

app.use(express.static(path.resolve(__dirname, "../build")));

server.listen(PORT, () => {
  console.log(`Server is Running on PORT ${PORT}`);
});

io.sockets.on("connection", function (socket) {
  //new user login
  userCount++;
  io.sockets.emit("system", userCount);
  socket.on("login", function (nickname) {
    //socket.userIndex = users.length;
    sockets[socket.id] = socket;
    socket.nickname = nickname;
    socket.isPaired = false;
    socket.pairCount = "";
    socket.otherUserId = "";
    priorityQueue.push(socket.id);
    socket.emit("loginSuccess");
    findPairForUser();
  });
  //user leaves or closes the browser tab or internet disconnect
  socket.on("disconnect", function () {
    if ("isPaired" in socket) {
      if (socket.isPaired) {
        pairedUser.del(socket.pairCount);
        const otherUserSocket = sockets[socket.otherUserId];
        otherUserSocket.emit("notification", "Reconnecting ...", "info");
        timer = setTimeout(() => {
          // wait for 5000 ms for partner to join
          otherUserSocket.emit("notification", "Your Partner left.", "danger");
          cleanupPair(otherUserSocket);
          delete sockets[socket.id];
        }, 10000);
      } else {
        delete sockets[socket.id];
      }
    }
    userCount--;
    socket.broadcast.emit("system", userCount);
  });
  //new message get
  socket.on("postMsg", function (msg) {
    const otherUserSocket = sockets[socket.otherUserId];
    otherUserSocket.emit("newMsg", socket.nickname, msg);
  });

  socket.on("previous id", ({ id: Id, nickname }) => {
    // delete previous socket
    if (Id in sockets) {
      // clear timer
      clearTimeout(timer);
      // id persists and response time < 5000ms
      const otherSocketId = sockets[Id].otherUserId;
      if (sockets[otherSocketId].isPaired) {
        socket.nickname = nickname;
        // cleanup previous socket
        delete sockets[Id];
        // register new socket
        sockets[socket.id] = socket;
        cleanupPair(socket);
        cleanupPair(sockets[otherSocketId]);
        pairing(socket.id, otherSocketId, false);
        sockets[socket.otherUserId].emit("remove notification");
      }
    } else {
      if (typeof Id !== "undefined") {
        sockets[socket.id] = socket;
        socket.nickname = nickname;
        cleanupPair(socket);
        socket.emit("notification", "You are disconnected", "danger");
      }
    }
  });
  socket.on("findAnotherPair", () => {
    if (socket.isPaired) {
      pairedUser.del(socket.pairCount);
      cleanupPair(sockets[socket.otherUserId]);
      sockets[socket.otherUserId].emit("notification", "Your Partner left.", "danger");
      cleanupPair(socket);
    }
    priorityQueue.push(socket.id);
    findPairForUser();
  });

  socket.on("getMeOut", () => {
    if (socket.isPaired) {
      pairedUser.del(socket.pairCount);
      cleanupPair(sockets[socket.otherUserId]);
      sockets[socket.otherUserId].emit("partnerLeft", "Your partner has left.");
      cleanupPair(socket);
    }
    socket.emit("partnerLeft", "You have successfully left the room.");
  });

  socket.on("timer expired", () => {
    if (socket.isPaired) {
      pairedUser.del(socket.pairCount);
      cleanupPair(sockets[socket.otherUserId]);
      sockets[socket.otherUserId].emit("partnerLeft", "Your time has ended.");
      cleanupPair(socket);
      socket.emit("partnerLeft", "Your time has ended.");
    }
  });

  function findPairForUser() {
    while (priorityQueue.length > 1) {
      pairing(priorityQueue[0], priorityQueue[1]);
    }
  }

  function pairing(s1, s2, bool) {
    if (pairedUser.set(pairCount, [s1, s2], 0)) {
      const userSocket = sockets[s1];
      const otherUserSocket = sockets[s2];
      pairCount++;
      prepareForPairing(userSocket, otherUserSocket, bool);
      prepareForPairing(otherUserSocket, userSocket, bool);
      priorityQueue.splice(0, 2);
    }
  }

  function prepareForPairing(e, f, bool = true) {
    e.isPaired = true;
    e.pairCount = pairCount;
    e.otherUserId = f.id;
    bool && e.emit("gotAPair", e.nickname, f.nickname);
  }

  function cleanupPair(e) {
    e.isPaired = false;
    e.pairCount = "";
    e.otherUserId = "";
  }
});
