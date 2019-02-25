
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
server.listen(8081, () => {
    server.clientUpdateRate = 1000 / 60; // Rate at which update packets are sent
    server.setUpdateLoop();
    console.log(`Listening on ${server.address().port}`);
    console.log(`Address should be: http://localhost:${server.address().port}`);
});

// ===========Websocket Stuff==============
var serverDebug = false;
var playerDebug = false;
var baddieDebug = false;
var itemsDebug = false;

/* The update package to be sent every update */
var package = {
    maps: {}, // TODO: Maybe use this
    players: {}, // List of all players in game
    baddies: {}, // List of all enemies in game
    items: {}
};

var testBaddieId = uniqid('baddie-');
package.baddies[testBaddieId] = {
    id: testBaddieId,
    xPos: 0,
    yPos: 0,
    health: 30,
    instances: {} // List of clients that have received this baddie
}
if (baddieDebug) {
    console.log("Test baddie with id" + package.baddies[testBaddieId].id);
}

io.on('connection', (client) => {
    if (serverDebug) {
        console.log("Connection with ID: " + client.id);
        client.emit('check', ("Check yoself " + client.id));
    }

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
        if (playerDebug) {
            console.log("Player list: ");
            console.log(package.players);
        };
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
            if (playerDebug) {
                console.log("Player list: ");
                console.log(package.players);
            };
        }
    });

    client.on('enterDungeon', () => {
        client.join("dungeon1");
    });

    client.on('test', (message) => {
        console.log(message);
    });

    client.on('receivedBaddie', baddie => {
        package.baddies[baddie.id].instances[client.id] = true;
        if (baddieDebug) {
            console.log(package.baddies[baddie.id]);
        };
    });

    client.on('updateBaddie', baddie => {
        if (baddie.health < 1) {
            delete package.baddies[baddie.id];
            console.log("Baddie " + baddie.id + " defeated");
        } else {
            package.baddies[baddie.id].xPos = baddie.xPos;
            package.baddies[baddie.id].yPos = baddie.yPos;
            package.baddies[baddie.id].health = baddie.health;
        }
        if (baddieDebug) {
            console.log(package.baddies[baddie.id]);
        }
    });

    client.on('itemCollected', itemId => {
        delete package.items[itemId];
        if (itemsDebug) {
            console.log(package.items);
        }
    });

    client.on('disconnect', () => {
        delete package.players[client.id];
        if (serverDebug) {
            console.log("Disconnection and removal with ID: " + client.id);
        }
        if (playerDebug) {
            console.log("Player list: ");
            console.log(package.players);
        }
    });

    client.on('instantiateDungeon', (mapData, callback) => {
        if (package.maps[mapData.name]) {
            callback("Dungeon exists");
        } else {
            package.maps[mapData.name] = {
                name: mapData.name,
                baddieSpawnPoint: mapData.baddieSpawnPoint,
            }

            mapData.itemsArray.forEach(item => {
                let id = uniqid("item-");
                package.items[id] = {
                    id: id,
                    xPos: item.xPos,
                    yPos: item.yPos,
                    properties: item.properties
                };
            });

            callback("Dungeon instantiated");

            if (itemsDebug) {
                console.log(package.items);
            }
        }
    });
});

server.sendUpdate = function () {
    io.to("dungeon1").emit('update', package);
}

server.setUpdateLoop = function () {
    setInterval(server.sendUpdate, server.clientUpdateRate);
};