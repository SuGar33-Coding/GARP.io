/*jshint esversion: 6 */
//const players = {};

const config = {
    renderer: Phaser.HEADLESS,
    parent: 'phaser-parent',
    width: 800,
    height: 600,
    physicsConfig: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 0 }
        }
    },
    state: {
        preload: preload,
        create: create,
        update: update
    }
};

function preload() {
    // Load tilemap stuff
    this.load.spritesheet('player', 'assets/sprites/Player2.png', 38, 64);
    this.load.spritesheet('attack', 'assets/sprites/attack.png', 16, 16);
    this.load.spritesheet('spear', 'assets/sprites/spear.png', 5, 57);
    this.load.spritesheet('baddie', 'assets/sprites/baddie.png');
    this.load.spritesheet('baddieHurt', 'assets/sprites/baddieHurt.png');
    this.load.spritesheet('chest', 'assets/sprites/chest.png');
    this.load.spritesheet('zombie', 'assets/sprites/zombie.png');
    this.load.spritesheet('playButton', 'assets/images/BetterPlayButton.png');
    this.load.spritesheet('createButton', 'assets/images/createButton.png');
    this.load.spritesheet('joinButton', 'assets/images/joinButton.png');
    this.load.spritesheet('deleteButton', 'assets/images/deleteButton.png');
    this.load.spritesheet('refreshButton', 'assets/images/refreshButton.png');
    this.load.tilemap('dungeon', 'assets/tilemaps/TileMap.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.image('gameTiles', 'assets/tilemaps/DungeonTileSet.png');

    this.load.image('ship', 'assets/spaceShips_001.png');
    this.load.image('star', 'assets/star_gold.png');
}

// create sets up all functions that game.js will provide to index.js
function create() {
    console.log("got to create");
    // ======Setting up the map=============

    // this.disconnectTimer = setTimeout(() => {
    //     console.log("Well that escalated quickly");
    // }, 2000);

    // Adds a tilemap object to the phaser game so that phaser can read from it
    this.map = this.game.add.tilemap('dungeon');
    // Selects the tilemap you are using.  TODO: After multiple maps are created, select one of the maps.
    this.map.addTilesetImage('DungeonSet', 'gameTiles');

    /* Sets background layer to layer called 'backgroundLayer' inside of the tilemap.
       Should leave these the same for every map for consistency purposes. */
    this.backgroundlayer = this.map.createLayer('backgroundLayer');
    this.wallLayer = this.map.createLayer('wallLayer');

    this.map.setCollisionBetween(1, 2000, true, 'wallLayer');

    this.backgroundlayer.resizeWorld();

    // =======Players========
    this.spriteScale = 1;

    this.playerSpawnPoints = findObjectsByType('playerStart', this.map, 'objectLayer');
    this.baddieSpawnPoints = findObjectsByType('enemy', this.map, 'objectLayer');

    // <--------------------------------------------------->

    this.addPlayer = (self, playerInfo) => {
        let player = self.add.sprite(self.playerStarts[0].x, self.playerStarts[0].y, 'player');
        player.anchor.setTo(.5);
        player.scale.setTo(self.spriteScale);
        player.smoothed = false;  // If we dont do this it looks like garbo cus of anti aliasing
        player.playerId = playerInfo.playerId;
        player.body.collideWorldBounds = true; // in case they cheat and get out of the walls
        //self.game.physics.arcade.enable(player);

        /* Teh SP34R */
        player.spear = player.addChild(self.make.sprite(10, 0, 'spear'));
        player.spear.exhausted = false; // A bool to check if it has already delt its desired damage after being used 
        //game.physics.arcade.enable(player.spear);
        player.spear.anchor.setTo(.5);

        self.players.add(player);
    };

    this.addBaddie = (self, baddieInfo) => {
        console.log("Creating baddie: " + baddieInfo.id);
        let baddie = this.add.sprite(self.baddieSpawnPoints.x, self.baddieSpawnPoints.y, 'baddie');
        baddie.anchor.setTo(.5);
        baddie.health = 30;
        baddie.id = baddieInfo.id;
        //baddie.targetPlayerId = baddieData.targetPlayerId;

        //this.game.physics.arcade.enable(baddie);
        self.baddies.add(baddie);
        //this.game.physics.arcade.enable(this.baddies)
        //this.actors.add(baddie)
    };

    this.handlePlayerMovement = function (self, playerId, input) {
        self.players.getChildren().forEach((player) => {
            if (playerId === player.playerId) {
                this.clients[player.playerId].input = input;
            }
        });
    };

    this.handlePlayerAttack = (self, playerId, input) => {
        let angleInRad = input;
        self.players.getChildren().forEach((player) => {
            if (playerId === player.playerId) {
                // Changing sprite positioning being moved to server side
                if ((angleInRad >= -0.3926991) && (angleInRad <= 0.3926991)) { // Attack to the right
                    player.spear.angle = 90;
                    player.spear.x = (player.width / 2);
                    player.spear.y = 0;
                } else if ((angleInRad > .3926991) && (angleInRad <= 1.178097)) { // Attack bottom right
                    player.spear.angle = 135;
                    player.spear.x = player.width / 2;
                    player.spear.y = player.height / 2;
                } else if ((angleInRad > 1.178097) && (angleInRad <= 1.9634954)) { // Attack Down
                    player.spear.angle = 180;
                    player.spear.x = 0;
                    player.spear.y = player.height / 2;
                } else if ((angleInRad > 1.9634954) && (angleInRad <= 2.7488936)) { // Attack Bottom left
                    player.spear.angle = 225;
                    player.spear.x = -player.width / 2;
                    player.spear.y = player.height / 2;
                } else if ((angleInRad > 2.7488936) || (angleInRad <= -2.7488936)) { // Attack Left
                    player.spear.angle = 270;
                    player.spear.x = -player.width / 2;
                    player.spear.y = 0;
                } else if ((angleInRad > -2.7488936) && (angleInRad <= -1.9634954)) { // Attack Top Left
                    player.spear.angle = 315;
                    player.spear.x = -player.width / 2;
                    player.spear.y = -player.height / 2;
                } else if ((angleInRad > -1.9634954) && (angleInRad <= -1.178097)) { // Attack Up
                    player.spear.x = 0;
                    player.spear.y = -player.height / 2;
                } else if ((angleInRad > -1.178097) && (angleInRad <= -0.3926991)) { // Attack top right
                    player.spear.angle = 45;
                    player.spear.x = player.width / 2;
                    player.spear.y = -player.height / 2;
                }

                self.game.time.events.add(50, () => {
                    self.game.physics.arcade.overlap(player.spear, self.baddies, self.damage, () => {
                        return !player.spear.exhausted;
                    }, self);
                }, self);
                self.game.time.events.add(300, () => {
                    player.spear.angle = 0;
                    player.spear.x = 10;
                    player.spear.y = 0;
                    player.spear.exhausted = false;
                }, self);
            }
        });


    };

    this.damage = (weapon, attacked) => {
        weapon.exhausted = true;
        attacked.damage(10);
        console.log(attacked.id + ": " + attacked.health);
    }

    this.removePlayer = function (self, playerId) {
        self.players.getChildren().forEach((player) => {
            if (playerId === player.playerId) {
                player.destroy();
            }
        });
    };

    this.clients = {};
    const self = this;
    this.message = 0;
    this.players = this.physics.add.group();
    this.baddies = this.physics.add.group();

    this.scores = {
        blue: 0,
        red: 0
    };

    this.star = this.physics.add.image(randomPosition(700), randomPosition(500), 'star');
    this.physics.add.collider(this.players);

    this.physics.add.overlap(this.players, this.star, function (star, player) {
        if (self.clients[player.playerId].team === 'red') {
            self.scores.red += 10;
            //console.log(self.scores.red);
        } else {
            self.scores.blue += 10;
            //console.log(self.scores.blue);
        }
        self.star.setPosition(randomPosition(700), randomPosition(500));
    });

    window.gameLoaded(this);
}

function update() {
    this.message += 1;
    this.players.getChildren().forEach((player) => {
        const input = this.clients[player.playerId].input;
        if (input.left) {
            player.body.velocity.x = -120;
        }
        if (input.right) {
            player.body.velocity.x = 120
        }
        if (input.up) {
            player.body.velocity.y = -120;
        }
        if (input.down) {
            player.body.velocity.y = 120;
        }

        // this.clients[player.playerId].x = player.x;
        // this.clients[player.playerId].y = player.y;
    });
}

function randomPosition(max) {
    return Math.floor(Math.random() * max) + 50;
}

/**
     * Returns an array of objects of type 'type' from specified layer
     * @param {*} type 
     * @param {*} map 
     * @param {*} layer 
     */
function findObjectsByType(type, map, layer) {
    var result = new Array();
    map.objects[layer].objects.forEach(function (element) {
        if (element.type === type) {
            element.y -= map.tileHeight;
            result.push(element);
        }
    });
    return result;
}

const game = new Phaser.Game(config);
