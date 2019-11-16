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
    this.load.image('ship', 'assets/spaceShips_001.png');
    this.load.image('star', 'assets/star_gold.png');
}

// create sets up all functions that game.js will provide to index.js
function create() {
    this.addPlayer = function (self, playerInfo) {
        const player = self.physics.add.image(playerInfo.x, playerInfo.y, 'ship').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
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
