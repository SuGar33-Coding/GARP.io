/*jshint esversion: 6 */
//const players = {};

const config = {
    type: Phaser.HEADLESS,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 0 }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    autoFocus: false
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
    // ======Setting up the map=============

    this.disconnectTimer = setTimeout(() => {
        console.log("Well that escalated quickly");
    }, 2000);

    // Adds a tilemap object to the phaser game so that phaser can read from it
    this.map = this.game.add.tilemap('dungeon');
    // Selects the tilemap you are using.  TODO: After multiple maps are created, select one of the maps.
    this.map.addTilesetImage('DungeonSet', 'gameTiles');

    /* Sets background layer to layer called 'backgroundLayer' inside of the tilemap.
       Should leave these the same for every map for consistency purposes. */
    this.backgroundlayer = this.map.createLayer('backgroundLayer');
    this.wallLayer = this.map.createLayer('wallLayer');

    // Do not need as client no longer checks collision
    // this.map.setCollisionBetween(1, 2000, true, 'wallLayer');

    this.backgroundlayer.resizeWorld();

    // <--------------------------------------------------->

    this.addPlayer = (self, playerInfo) => {
        let player = self.physics.add.image(playerInfo.x, playerInfo.y, 'ship').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
        player.setDrag(100);
        player.setAngularDrag(100);
        player.setMaxVelocity(200);
        player.playerId = playerInfo.playerId;
        self.players.add(player);
    };

    this.handlePlayerInput = function (self, playerId, input) {
        self.players.getChildren().forEach((player) => {
            if (playerId === player.playerId) {
                this.clients[player.playerId].input = input;
            }
        });
    };

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
            player.setAngularVelocity(-300);
        } else if (input.right) {
            player.setAngularVelocity(300);
        } else {
            player.setAngularVelocity(0);
        }

        if (input.up) {
            this.physics.velocityFromRotation(player.rotation + 1.5, 200, player.body.acceleration);
        } else {
            player.setAcceleration(0);
        }

        this.clients[player.playerId].x = player.x;
        this.clients[player.playerId].y = player.y;
        this.clients[player.playerId].rotation = player.rotation;
    });
    this.physics.world.wrap(this.players, 5);
}

function randomPosition(max) {
    return Math.floor(Math.random() * max) + 50;
}

const game = new Phaser.Game(config);
