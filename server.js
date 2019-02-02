
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

// ===========Server Stuff=================
// Request routing
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

// Start listening
server.listen(8081, function () {
    server.clientUpdateRate = 1000 / 60; // Rate at which update packets are sent
    server.setUpdateLoop();
    console.log(`Listening on ${server.address().port}`);
    console.log(`Address should be: http://localhost:${server.address().port}`);
});

// ===========Websocket Stuff==============

// list of all players in game
var players = {};

io.on('connection', (client) => {
    console.log("Connection with ID: " + client.id);
    client.emit('check', ("Check yoself " + client.id));

    client.on("addPlayerToServer", (playerData) => {
        player = {
            id: client.id,
            xPos: playerData.xPos,
            yPos: playerData.yPos
        }
        players[client.id] = player;
        console.log("Player list: ");
        console.log(players);
    });

    client.on('playerMoved', (playerData) => {
        if (players[client.id]) { //check for erroneous server restart with peristent client
            players[client.id].xPos = playerData.xPos;
            players[client.id].yPos = playerData.yPos;
        } else { //TODO: Implement a way for the client to reconcile this too...
            //console.log("Player no longer exists on server, creating new server-side player instance");
            console.log("Player no longer exists on server...");
            
            // this only adds the player on server side, the client doesn't recognize the new socket id's
            player = {
                id: client.id,
                xPos: playerData.xPos,
                yPos: playerData.yPos
            }
            players[client.id] = player;
            console.log("Player list: ");
            console.log(players);
            
        }
    });

    client.on('enterDungeon', () => {
        client.join("dungeon");
    });

    client.on('test', (message) => {
        console.log(message);
    });

    client.on('disconnect', () => {
        delete players[client.id];
        console.log("Disconnection and removal with ID: " + client.id);
    });
});

server.sendUpdate = function () {
    io.to("dungeon").emit('updatePlayers', players);
}

server.setUpdateLoop = function () {
    setInterval(server.sendUpdate, server.clientUpdateRate);
};