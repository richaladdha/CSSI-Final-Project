console.log("My socket server is running!");

let express = require('express');

let app = express();

let server = app.listen(process.env.PORT);

console.log('Your app is running on port: ' + server.address().port);

app.use(express.static('public'));

let socket = require('socket.io');

let io = socket(server);

io.sockets.on('connection', newConnection);

function newConnection(connection){
  console.log("New connection received " + connection.id);   
  
  connection.on("draw", handleDraw);
  
  function handleDraw(data){
    console.log(data);
    
    connection.broadcast.emit("draw", data);
  }
  
  connection.on("score", handleScore);
  
  function handleScore(data){
    console.log(data);
    
    connection.broadcast.emit("score", data);
  }
}