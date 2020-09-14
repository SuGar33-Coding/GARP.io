/*jshint esversion: 6 */
const path = require('path');
const jsdom = require('jsdom');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io').listen(server);
const uniqid = require('uniqid');
const Datauri = require('datauri');

const datauri = new Datauri();
const { JSDOM } = jsdom;

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

var instances = {};
var connectedClients = new Set();

// Sets up headless phaser to be able to run on the server with just a name
function newPhaserInstance(roomName, id) {
    JSDOM.fromFile(path.join(__dirname, 'server/index.html'), {
        // To run the scripts in the html file
        runScripts: "dangerously",
        // Also load supported external resources
        resources: "usable",
        // So requestAnimatinFrame events fire
        pretendToBeVisual: true
    }).then((dom) => {
        dom.window.URL.createObjectURL = (blob) => {
            if (blob) {
                return datauri.format(blob.type, blob[Object.getOwnPropertySymbols(blob)[0]]._buffer).content;
            }
        };
        dom.window.URL.revokeObjectURL = (objectURL) => { };
        dom.window.gameLoaded = (game) => {
            // add created game to instances
            // TODO: get rid of id, and dissallow duplicate names (change CLI to reflect this)
            instances[roomName] = game;
            game.id = id;

            // add a test baddie
            game.addBaddie({ id: uniqid('baddie-') });
        };
        // inject socketIO into the Phaser instance
        dom.window.io = io;
        // inject the uniq room name into the Phaser instance
        dom.window.roomName = roomName;
    }).catch((error) => {
        console.log(error.message);
    });
}

// hard-coded test instance
var id1 = uniqid("room-");
var name1 = 'default';
// newPhaserInstance(name1, id1);

/* ========Handle socket.io connections========= */

io.on('connection', socket => {
    socket.emit('check', 'weesnaw');
    // Add client to global list for consistency
    connectedClients.add(socket.id);

    let game;
    let players;

    // simulate multi room joining
    // if (counter < 2) {
    //     roomName = name1;
    //     counter += 1;
    // } else {
    //     roomName = name2;
    // }

    // when a player moves, takes in a json that tells it what key is pressed down, then updates the player data
    socket.on('playerMovement', inputData => {
        game.handlePlayerMovement(socket.id, inputData);
    });

    // same for when a player attacks
    socket.on('playerAttack', inputData => {
        game.handlePlayerAttack(socket.id, inputData);
    });

    // give list of instances to client
    socket.on('reqServers', (foo, callback) => {
        console.log('Instances upon request: ' + Object.keys(instances));
        callback(Object.keys(instances));
    });

    socket.on('instantiateDungeon', (name, callback) => {
        if (instances.hasOwnProperty(name)) {
            callback(`Dungeon name '${name}' is taken`);
        } else {
            newPhaserInstance(name, uniqid("room-"));
            callback(`Dungeon '${name}' has been created on server`);
        }
    });

    // try to put client in instance and set up their game
    socket.on('joinDungeon', (roomName, callback) => {
        // if that server name doesn't exist
        if (!instances.hasOwnProperty(roomName)) {
            callback(false);
            return;
        }

        // get the phaser instance, including its functions
        game = instances[roomName];
        // get list of players by socket.io id in this instance
        // players = game.clients;
        // join the socket.io room for this instance
        socket.join(roomName);
        // create a new default player object in players
        // players[socket.id] = {
        //     xPos: 0,
        //     yPos: 0,
        //     playerId: socket.id,
        //     input: {
        //         left: false,
        //         right: false,
        //         up: false,
        //         down: false
        //     },
        //     xPosSpear: 0,
        //     yPosSpear: 0,
        //     angleSpear: 0
        // };
        // add player to server instance
        game.addPlayer(socket.id);

        // send the players object to this client
        socket.emit('currentPlayers', game.clients);

        // update all other players of the new player
        socket.broadcast.to(roomName).emit('newPlayer', game.clients[socket.id]);

        // send the star object
        socket.emit('starLocation', { x: game.star.x, y: game.star.y });

        // send the current scores
        socket.emit('updateScore', game.scores);
        // TODO: Send all the data for baddies, treasures, and other objects for the game

        console.log('User ' + socket.id + ' connected to room: ' + roomName);
        callback(true);
    });

    socket.on('disconnect', () => {
        connectedClients.delete(socket.id);
        console.log('User ' + socket.id + ' disconnected');
        // First make sure we actually connected to a game
        if (game) {
            // remove player from server
            game.removePlayer(socket.id);
            // remove this player from our players object
            delete players[socket.id];
            // emit a message to all players in instance to remove this player
            // TODO: check if this doesnt break anything
            io.to(roomName).emit('disconnect', socket.id);
        }
    });
});

/* =========Configure and spin up server============= */

server.sendUpdate = () => {
    // TODO: Bundle all these updates into one update package
    Object.keys(instances).forEach(roomName => {
        let game = instances[roomName];
        io.to(roomName).emit('playerUpdate', game.clients);
        io.to(roomName).emit('updateScore', game.scores);
        io.to(roomName).emit('starLocation', { x: game.star.x, y: game.star.y });
    });
};

server.setUpdateLoop = () => {
    setInterval(server.sendUpdate, server.clientUpdateRate);
};

server.listen(8082, () => {
    // Rate at which update packets are sent
    server.clientUpdateRate = 1000 / 40;

    // Start the update loop
    server.setUpdateLoop();

    console.log(`Listening on ${server.address().port}`);
    console.log(`Address should be: http://localhost:${server.address().port}`);

    // Start CLI prompt
    readline.prompt();
});

/* ==========Define CLI========== */

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'GARPio CLI > '
});

// List of defined inputs for CLI
let inputs = {
    secret: () => console.log(`You found the secret! UwU xD *nuzzles you*`),
    // TODO: make sure connectedClients variable is actually consistent
    clients: () => console.log(`Connected clients: ${JSON.stringify(Array.from(connectedClients))}`),
    instances: () => console.log(`List of instances: ${Object.keys(instances)}`),
    instances_v: () => {
        console.log('=======');
        Object.keys(instances).forEach(key => {
            console.log(instances[key].id);
            instances[key].baddies.children.entries.forEach(baddie => {
                console.log('\t' + baddie.name);
            });
        });
        console.log('=======');
    },
    help: () => console.log(inputs)
};

// defines handler for the event that a line is entered
readline.on('line', input => {
    // Try to run the named function from user input
    try {
        inputs[input]();
    } catch (error) {
        console.log(`'${input}' is not a valid input`);
        // console.log(error);
    }
    readline.prompt();
});