
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io').listen(server);
const uniqid = require('uniqid');

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

/* The update package to be sent every update */
var package = {
    mapData: {},
    players: {}, // List of all players in game
    baddies: {}
};

var testBaddieId = uniqid('baddie-');
package.baddies[testBaddieId] = {
    id: testBaddieId,
    xPos: 0,
    yPos: 0,
    health: 30,
    instances: {}
}

io.on('connection', (client) => {
    console.log("Connection with ID: " + client.id);
    client.emit('check', ("Check yoself " + client.id));

    client.on("addPlayerToServer", (playerData) => {
        player = {
            id: client.id,
            xPos: playerData.xPos,
            yPos: playerData.yPos,
            xPosSpear: playerData.xPosSpear,
            yPosSpear: playerData.yPosSpear,
            angleSpear: playerData.angleSpear
        }
        package.players[client.id] = player;
        console.log("Player list: ");
        console.log(package.players);
    });

    client.on('playerMoved', (playerData) => {
        /* check for erroneous server restart with peristent client */
        if (package.players[client.id]) { // If player does indeed exist on the current player list
            package.players[client.id].xPos = playerData.xPos;
            package.players[client.id].yPos = playerData.yPos;
        } else { //TODO: Implement a way for the client to reconcile this too...
            //console.log("Player no longer exists on server, creating new server-side player instance");
            console.log("Player no longer exists on server...");

            // this only adds the player on server side, the client doesn't recognize the new socket id's
            player = {
                id: client.id,
                xPos: playerData.xPos,
                yPos: playerData.yPos,
                xPosSpear: playerData.xPosSpear,
                yPosSpear: playerData.yPosSpear,
                angleSpear: playerData.angleSpear
            }
            package.players[client.id] = player;
            console.log("Player list: ");
            console.log(package.players);
        }
    });

    client.on('enterDungeon', () => {
        client.join("dungeon1");
    });

    client.on('test', (message) => {
        console.log(message);
    });

    client.on('disconnect', () => {
        delete package.players[client.id];
        console.log("Disconnection and removal with ID: " + client.id);
        console.log("Player list: ");
        console.log(package.players);
    });
});

server.sendUpdate = function () {
    io.to("dungeon1").emit('update', package);
}

server.setUpdateLoop = function () {
    setInterval(server.sendUpdate, server.clientUpdateRate);
};