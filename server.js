
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
var playerDebug = false;
var baddieDebug = false;
var itemsDebug = false;

/* The update package to be sent every update */
var package = {
    dungeons: {}
    //players: {}, // List of all players in game
    //baddies: {}, // List of all enemies in game
    //items: {},
    //score: 0
};

io.on('connection', (client) => {
    /** 
     * Should only be set once, when the player enters a dungeon 
     * Used as a client-scoped reference to the dungeon that the plater is in
     * */
    var dungeonName;

    if (serverDebug) {
        console.log("Connection with ID: " + client.id);
        client.emit('check', ("Check yoself " + client.id));
    };

    client.on('joinDungeon', (name, callback) => {
        if (package.dungeons[name]) {
            client.join(name);
            dungeonName = name;
            callback(true);
        } else {
            callback(false);
        }
    });

    client.on("addPlayerToServer", (playerData) => {
        player = {
            id: client.id,
            xPos: playerData.xPos,
            yPos: playerData.yPos,
            xPosSpear: playerData.xPosSpear,
            yPosSpear: playerData.yPosSpear,
            angleSpear: playerData.angleSpear
        }

        package.dungeons[dungeonName].players[client.id] = player;
        package.dungeons[dungeonName].newborn = false; // Our little babby server ain't a kid no more :')
        if (playerDebug) {
            console.log("Player list: ");
            console.log(package.dungeons[dungeonName].players);
        };
    });

    client.on('playerMoved', (playerData) => {
        /* check for erroneous server restart with peristent client */
        if (package.dungeons[dungeonName].players[client.id]) { // If player does indeed exist on the current player list
            package.dungeons[dungeonName].players[client.id].xPos = playerData.xPos;
            package.dungeons[dungeonName].players[client.id].yPos = playerData.yPos;
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
            package.dungeons[dungeonName].players[client.id] = player;
            if (playerDebug) {
                console.log("Player list: ");
                console.log(package.dungeons[dungeonName].players);
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
        package.dungeons[dungeonName].baddies[baddie.id].instances[client.id] = true;
        if (baddieDebug) {
            console.log(package.dungeons[dungeonName].baddies[baddie.id]);
        };
    });

    client.on('updateBaddie', baddie => {
        if (baddie.health < 1) {
            delete package.dungeons[dungeonName].baddies[baddie.id];
            package.dungeons[dungeonName].score++;
            if (baddieDebug) {
                console.log("Baddie " + baddie.id + " defeated");
            }
        } else {
            package.dungeons[dungeonName].baddies[baddie.id].xPos = baddie.xPos;
            package.dungeons[dungeonName].baddies[baddie.id].yPos = baddie.yPos;
            package.dungeons[dungeonName].baddies[baddie.id].health = baddie.health;
        }
        if (baddieDebug) {
            console.log(package.dungeons[dungeonName].baddies[baddie.id]);
        }
    });

    client.on('itemCollected', itemId => {
        delete package.dungeons[dungeonName].items[itemId];
        package.dungeons[dungeonName].score++;

        if (itemsDebug) {
            console.log(package.dungeons[dungeonName].items);
        }
    });

    /**
     * Creates a new dungeon instance on the server
     * Called from the client side
     */
    client.on('instantiateDungeon', (mapData, callback) => {
        let mapName = mapData.name;

        if (package.dungeons[mapName]) {
            callback("Dungeon exists");
        } else {
            package.dungeons[mapName] = {
                name: mapName,
                baddieSpawnPoint: mapData.baddieSpawnPoint,
                players: {}, // List of all players in dungeon
                baddies: {}, // List of all enemies in dungeon
                items: {},
                score: 0,
                newborn: true // Used for auto-closing dungeons upon the last remianing player leaving
            }

            mapData.itemsArray.forEach(item => {
                let id = uniqid("item-");
                package.dungeons[mapName].items[id] = {
                    id: id,
                    xPos: item.xPos,
                    yPos: item.yPos,
                    properties: item.properties
                };
            });

            callback("Dungeon instantiated");

            if (itemsDebug) {
                console.log(package.dungeons[mapName].items);
            }

            // move all the updatepacket info to under the map and add player to map on entry
            var testBaddieId = uniqid('baddie-');
            package.dungeons[mapName].baddies[testBaddieId] = {
                id: testBaddieId,
                xPos: package.dungeons[mapData.name].baddieSpawnPoint.x,
                yPos: package.dungeons[mapData.name].baddieSpawnPoint.y,
                health: 30,
                instances: {} // List of clients that have received this baddie
            }

            var generateRandomBaddies = () => {
                var testBaddieId = uniqid('baddie-');
                package.dungeons[mapName].baddies[testBaddieId] = {
                    id: testBaddieId,
                    xPos: package.dungeons[mapData.name].baddieSpawnPoint.x + Math.random() * 100,
                    yPos: package.dungeons[mapData.name].baddieSpawnPoint.y + Math.random() * 100,
                    health: 30,
                    instances: {}
                }
                if (baddieDebug) {
                    console.log("Baddie " + package.dungeons[mapName].baddies[testBaddieId].id + " spawned at: "
                        + package.dungeons[mapName].baddies[testBaddieId].xPos
                        + ", " + package.dungeons[mapName].baddies[testBaddieId].yPos);
                }
            };

            package.dungeons[mapData.name].baddieInterval = setRandomizedInterval(generateRandomBaddies, 15000);
        }
    });

    client.on('reqServers', (nothin, callback) => {
        if (package.dungeons) {
            if (serverDebug) {
                console.log("Sending: " + Object.keys(package.dungeons));
            };
            callback(Object.keys(package.dungeons));
        } else {
            callback("No servers available");
        }

    });

    client.on('closeDungeon', closeDungeon);

    client.on('disconnect', () => {
        /* Checks if client entered a server first */
        if (package.dungeons[dungeonName] && package.dungeons[dungeonName].players[client.id]) {
            delete package.dungeons[dungeonName].players[client.id];
            /* If leaving player was the last remaining player, close dungeon */
            if (!package.dungeons[dungeonName].newborn && Object.keys(package.dungeons[dungeonName].players).length === 0 && package.dungeons[dungeonName].players.constructor === Object) {
                closeDungeon(dungeonName);
            }
        }

        /* This is for closing dungeons when all players have left
         * It's not being used right nao
        if (Object.keys(package.dungeons[dungeonName].players).length === 0 && package.dungeons[dungeonName].players.constructor === Object) {
            
        } else {
            
        }
        */

        if (serverDebug) {
            console.log("Disconnection and removal with ID: " + client.id);
        }
        if (playerDebug) {
            console.log("Player list: ");
            console.log(package.dungeons[dungeonName].players);
        }
    });
});

server.sendUpdate = () => {
    Object.keys(package.dungeons).forEach(roomName => {
        Object.keys(package.dungeons[roomName].baddies).forEach(baddieid => {
            this.baddie = package.dungeons[roomName].baddies[baddieid];
            this.baddie.closest = 100000;
            Object.keys(package.dungeons[roomName].players).forEach(playerid =>{
                this.player = package.dungeons[roomName].players[playerid];
                console.log(Math.hypot(this.player.xPos, this.player.yPos))
                this.baddie.closest = Math.min(this.baddie.closest, Math.hypot(this.player.xPos, this.player.yPos))
            }, this);
        }, this);

        io.to(roomName).emit('update', package.dungeons[roomName]);
    });
};

server.setUpdateLoop = () => {
    setInterval(server.sendUpdate, server.clientUpdateRate);
};

function closeDungeon(dungeonName, callback) {
    //Fix the bug where a server restart and subsequent stale client restart crashes the server
    //Proposed fix: do a timed check to kick the client after a second or two if they can't prove they are a non-stale client... not sure how to do that tho
    //Temp working fix: clients cannot recconect after initial connect
    //Long-term apparently working fix: Check if map exists before closing
    //TODO: but now that means that players dont get kicked if a map closes, so need a way to reconcile that

    if (package.dungeons[dungeonName]) {
        package.dungeons[dungeonName].baddieInterval.clear();
        delete package.dungeons[dungeonName];
        if (callback) {
            callback("Dungeon: " + dungeonName + " closed");
        }
    } else {
        if (callback) {
            callback("No such dungeon exists");
        }
    }
}