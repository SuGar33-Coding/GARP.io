
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io').listen(server);
const uniqid = require('uniqid');
const setRandomizedInterval = require('randomized-interval');

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
var playerDebug = true;
var baddieDebug = false;
var itemsDebug = false;

/* The update package to be sent every update */
var package = {
    "dungeons": {},
    players: {}, // List of all players in game
    baddies: {}, // List of all enemies in game
    items: {},
    score: 0
};

io.on('connection', (client) => {
    if (serverDebug) {
        console.log("Connection with ID: " + client.id);
        client.emit('check', ("Check yoself " + client.id));
    };

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
        } else { //TODO: Implement a way for the client to reconcile this too... ~ As of now, clients cannot recconect ~
            console.log("Player no longer exists on server, creating new server-side player instance");

            // this only adds the player on server side, the client doesn't recognize the new socket id's of other players
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
            package.score++;
            if (baddieDebug) {
                console.log("Baddie " + baddie.id + " defeated");
            }
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
        package.score++;

        if (itemsDebug) {
            console.log(package.items);
        }
    });

    client.on('instantiateDungeon', (mapData, callback) => {
        if (package.dungeons[mapData.name]) {
            callback("Dungeon exists");
        } else {
            package.dungeons[mapData.name] = {
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

            client.dungeonName = mapData.name;

            callback("Dungeon instantiated");

            if (itemsDebug) {
                console.log(package.items);
            }

            var testBaddieId = uniqid('baddie-');
            package.baddies[testBaddieId] = {
                id: testBaddieId,
                xPos: package.dungeons['dungeon1'].baddieSpawnPoint.x,
                yPos: package.dungeons['dungeon1'].baddieSpawnPoint.y,
                health: 30,
                instances: {} // List of clients that have received this baddie
            }

            var generateRandomBaddies = () => {
                var testBaddieId = uniqid('baddie-');
                package.baddies[testBaddieId] = {
                    id: testBaddieId,
                    xPos: package.dungeons['dungeon1'].baddieSpawnPoint.x + Math.random() * 100,
                    yPos: package.dungeons['dungeon1'].baddieSpawnPoint.y + Math.random() * 100,
                    health: 30,
                    instances: {}
                }
                if (baddieDebug) {
                    console.log("Baddie " + package.baddies[testBaddieId].id + " spawned at: "
                        + package.baddies[testBaddieId].xPos
                        + ", " + package.baddies[testBaddieId].yPos);
                }
            };

            package.dungeons[mapData.name].baddieInterval = setRandomizedInterval(generateRandomBaddies, 15000);
        }
    });

    client.on('reqServers', (nothin, callback) => {
        console.log(package);
        if (package.dungeons) {
            console.log("Sending: " + Object.keys(package.dungeons));
            callback(Object.keys(package.dungeons));
        } else {
            callback("No servers available");
        }

    });

    client.on('closeDungeon', (mapName, callback) => {
        //TODO: Fix the bug where a server restart and subsequent stale client restart crashes the server
        //Proposed fix: do a timed check to kick the client after a second or two if they can't prove they are a non-stale client... not sure how to do that tho
        //Temp working fix: clients cannot recconect after initial connect

        if (package.dungeons[mapName]) {
            package.dungeons[mapName].baddieInterval.clear();
            delete package.dungeons[mapName];

            // Eventually these will be properties of each map. For now, hax
            package.items = {};
            package.baddies = {};
            package.score = 0;
            callback("Dungeon: " + mapName + " closed");
        } else {
            callback("No such dungeon exists");
        }

    });

    client.on('disconnect', () => {
        delete package.players[client.id];
        /* This is for closing dungeons when all players have left
         * It's not being used right nao
        if (Object.keys(package.players).length === 0 && package.players.constructor === Object) {
            
        } else {
            
        }
        */

        if (serverDebug) {
            console.log("Disconnection and removal with ID: " + client.id);
        }
        if (playerDebug) {
            console.log("Player list: ");
            console.log(package.players);
        }
    });
});

server.sendUpdate = () => {
    io.to("dungeon1").emit('update', package);
};

server.setUpdateLoop = () => {
    setInterval(server.sendUpdate, server.clientUpdateRate);
};