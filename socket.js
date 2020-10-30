const io = require("socket.io");
const server = io.listen(8080);

server.on("connection", function(socket) {
  console.log("user connected");
  socket.emit("welcome", "welcome man");
});