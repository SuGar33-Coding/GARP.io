/* jshint esversion: 6 */

// Putting it in a class so I can get the intellisense
class Instance extends Phaser.Scene {
    preload() {
        // console.log("got to preload");
        // Load tilemap stuff 
        this.load.image('player', 'assets/sprites/Player2.png');
        this.load.image('attack', 'assets/sprites/attack.png');
        this.load.image('spear', 'assets/sprites/spear.png');
        this.load.image('baddie', 'assets/sprites/baddie.png');
        this.load.image('baddieHurt', 'assets/sprites/baddieHurt.png');
        this.load.image('chest', 'assets/sprites/chest.png');
        this.load.image('zombie', 'assets/sprites/zombie.png');
        this.load.image('playButton', 'assets/images/BetterPlayButton.png');
        this.load.image('createButton', 'assets/images/createButton.png');
        this.load.image('joinButton', 'assets/images/joinButton.png');
        this.load.image('deleteButton', 'assets/images/deleteButton.png');
        this.load.image('refreshButton', 'assets/images/refreshButton.png');
        this.load.tilemapTiledJSON('dungeon', 'assets/tilemaps/TileMap.json');
        this.load.image('gameTiles', 'assets/tilemaps/DungeonTileSet.png');

        this.load.image('ship', 'assets/spaceShips_001.png');
        this.load.image('star', 'assets/star_gold.png');
    }

    create() {
        // Declare this for consistent usage within function scopes
        // (Use 'self' instead of 'this' when in a function block)
        const self = this;


        // this.disconnectTimer = setTimeout(() => {
        //     console.log("Well that escalated quickly");
        // }, 2000);

        /* ==========Define functions========== */

        this.addPlayer = (playerId) => {
            let player = self.physics.add.sprite(self.playerSpawnPoints[0].x, self.playerSpawnPoints[0].y, 'player')
                .setVelocity(0, -5);
            // player.anchor.setTo(.5);
            // player.scale.setTo(self.spriteScale);
            // player.smoothed = false;  // If we dont do this it looks like garbo cus of anti aliasing
            player.playerId = playerId;
            player.input = {
                left: false,
                right: false,
                up: false,
                down: false
            }
            // player.body.collideWorldBounds = true; // in case they cheat and get out of the walls
            //self.game.physics.arcade.enable(player);

            /* Teh SP34R */
            // player.spear = player.addChild(self.make.sprite(10, 0, 'spear'));
            // player.spear.exhausted = false; // A bool to check if it has already delt its desired damage after being used 
            //game.physics.arcade.enable(player.spear);
            // player.spear.anchor.setTo(.5);

            self.players.add(player);
        };

        this.addBaddie = (baddieInfo) => {
            // console.log("Creating baddie: " + baddieInfo.id);
            let baddie = self.baddies.create(self.baddieSpawnPoints.x, self.baddieSpawnPoints.y, 'baddie');
            baddie.name = baddieInfo.id;
            // baddie.anchor.setTo(.5);
            // baddie.health = 30;
            //baddie.targetPlayerId = baddieData.targetPlayerId;

            //this.game.physics.arcade.enable(baddie);
            // self.baddies.add(baddie);
            //this.game.physics.arcade.enable(this.baddies)
            //this.actors.add(baddie)
        };

        this.handlePlayerMovement = (playerId, input) => {
            self.players.getChildren().forEach((player) => {
                if (playerId === player.playerId) {
                    this.clients[player.playerId].input = input;
                    player.input = input;
                }
            });
        };

        this.handlePlayerAttack = (playerId, input) => {
            let angleInRad = input;
            self.players.getChildren().forEach((player) => {
                if (playerId === player.playerId) {
                    // Changing sprite positioning being moved to server side
                    if ((angleInRad >= -0.3926991) && (angleInRad <= 0.3926991)) { // Attack to the right
                        player.spear.angle = 90;
                        player.spear.x = (player.width / 2);
                        player.spear.y = 0;
                    } else if ((angleInRad > 0.3926991) && (angleInRad <= 1.178097)) { // Attack bottom right
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
        };

        this.removePlayer = (playerId) => {
            self.players.getChildren().forEach((player) => {
                if (playerId === player.playerId) {
                    player.destroy();
                }
            });
        };

        // ======Setting up the map=============

        // Adds a tilemap object to the phaser game so that phaser can read from it
        this.map = this.make.tilemap({ key: 'dungeon' });
        // Selects the tilemap you are using.  TODO: After multiple maps are created, select one of the maps.
        this.map.addTilesetImage('DungeonSet', 'gameTiles');

        /* Sets background layer to layer called 'backgroundLayer' inside of the tilemap.
           Should leave these the same for every map for consistency purposes. */
        this.backgroundlayer = this.map.createStaticLayer('backgroundLayer', 'DungeonSet')

        // this.wallLayer = this.map.createLayer('wallLayer');
        this.wallLayer = this.map.createStaticLayer('wallLayer', 'DungeonSet');

        // this.map.setCollisionBetween(1, 2000, true, 'wallLayer');

        //this.backgroundlayer.resizeWorld();

        // =======Players========
        this.spriteScale = 1;

        // 0 in this function means objectLayer (and hopefully stays that way)
        this.playerSpawnPoints = findObjectsByType('playerStart', this.map, 'objectLayer');
        this.baddieSpawnPoints = findObjectsByType('enemy', this.map, 'objectLayer');

        this.clients = {};
        this.message = 0;
        this.players = this.add.group();
        this.baddies = this.physics.add.group();
        this.players.set

        this.scores = {
            blue: 0,
            red: 0
        };

        // this.star = this.physics.add.image(randomPosition(700), randomPosition(500), 'star');
        this.physics.add.collider(this.players);

        // this.physics.add.overlap(this.players, this.star, function (star, player) {
        //     if (self.clients[player.playerId].team === 'red') {
        //         self.scores.red += 10;
        //         //console.log(self.scores.red);
        //     } else {
        //         self.scores.blue += 10;
        //         //console.log(self.scores.blue);
        //     }
        //     self.star.setPosition(randomPosition(700), randomPosition(500));
        // });

        window.gameLoaded(this);
    }

    update() {
        this.message += 1;
        // Object.keys(this.clients).forEach(player => {
        //     const input = this.clients[player].input;
        //     if (input.left) {
        //         player.body.velocity.x = -120;
        //     }
        //     if (input.right) {
        //         player.body.velocity.x = 120;
        //     }
        //     if (input.up) {
        //         player.body.velocity.y = -120;
        //     }
        //     if (input.down) {
        //         player.body.velocity.y = 120;
        //     }

        //     // this.clients[player.playerId].x = player.x;
        //     // this.clients[player.playerId].y = player.y;
        // });

        // console.log(this.players)
        this.players.getChildren().forEach(player => {
            this.clients[player.playerId] = player;
            
            const input = player.input;
            player.setVelocity(0,0);
            if (input.left) {
                player.setVelocityX(-120);
            }
            if (input.right) {
                player.setVelocityX(120);
            }
            if (input.up) {
                player.setVelocityY(-120);
            }
            if (input.down) {
                player.setVelocityY(120);
            }
        })
    }

    getClients(callback) {
        callback(this.clients);
    }
}

function randomPosition(max) {
    return Math.floor(Math.random() * max) + 50;
}

/**
 * Returns an array of objects of type 'type' from specified layer
 * @param {String} type 
 * @param {Phaser.Tilemaps.ObjectLayer} map 
 * @param {String} layer 
 */
function findObjectsByType(type, map, layer) {
    let result = [];
    let layerObj = map.getObjectLayer(layer);
    layerObj.objects.forEach(function (element) {
        if (element.type === type) {
            element.y -= map.tileHeight;
            result.push(element);
        }
    });
    return result;
}

const config = {
    type: Phaser.HEADLESS,
    parent: 'garp-canvas',
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 0 }
        }
    },
    scene: [Instance],
    autoFocus: false
};

const game = new Phaser.Game(config);