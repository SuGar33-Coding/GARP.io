GARP.Dungeon = function () { };

GARP.Dungeon.prototype = {

    create: function () {
        this.instance = this;

        // Setting up the map

        this.map = this.game.add.tilemap('dungeon');

        this.map.addTilesetImage('DungeonSet', 'gameTiles');

        this.backgroundlayer = this.map.createLayer('backgroundLayer');
        this.wallLayer = this.map.createLayer('wallLayer');

        this.map.setCollisionBetween(1, 2000, true, 'wallLayer');

        this.backgroundlayer.resizeWorld();

        // Dealing with player
        var playerStarts = this.findObjectsByType('playerStart', this.map, 'objectLayer');
        this.player = this.add.sprite(playerStarts[0].x, playerStarts[0].y, 'player');
        this.player.anchor.setTo(.5);

        this.game.physics.arcade.enable(this.player);
        this.playerSpeed = 120;
        this.player.body.collideWorldBounds = true;

        this.player.animations.add('rightWalk', [0]);
        this.player.animations.add('leftWalk', [1]);

        GARP.Client.sendPlayer(this.player.x, this.player.y);
        GARP.Client.testFunc();

        // Dealing with other players
        this.otherPlayers = this.add.group();
        this.otherPlayers.forEach(bitch => {
            console.log(bitch);
        });
        GARP.Client.socket.on('updatePlayers', (playerList) => {
            //GARP.Dungeon.prototype.updateOtherPlayers(playerList);
            //this.updateOtherPlayers(playerList);
            Object.keys(playerList).forEach(id => {
                if (id !== GARP.Client.socket.id) {
                    let indexedPlayer = null;
                    this.otherPlayers.forEach(otherPlayer => {
                        if (id === otherPlayer.id) {
                            indexedPlayer = otherPlayer;
                        }
                    }, this);
                    if (indexedPlayer) { // if player exists in otherPlayers
                        indexedPlayer.x = playerList[id].xPos;
                        indexedPlayer.y = playerList[id].yPos;
                    } else { // if not, create one
                        this.createOtherPlayer(playerList[id]);
                    }
                }
            });
        });

        // Dealing with baddie
        var baddieStarts = this.findObjectsByType('enemy', this.map, 'objectLayer');
        this.enemy = this.add.sprite(baddieStarts[0].x, baddieStarts[0].y, 'baddie');
        this.enemy.anchor.setTo(.5);
        this.enemy.health = 30;

        this.actors = this.game.add.group();
        this.actors.add(this.player);
        this.actors.add(this.enemy);
        this.game.physics.arcade.enable(this.actors);

        this.game.camera.follow(this.player);

        this.cursors = this.game.input.keyboard.createCursorKeys();

        this.wasd = {
            up: this.game.input.keyboard.addKey(Phaser.Keyboard.W),
            down: this.game.input.keyboard.addKey(Phaser.Keyboard.S),
            left: this.game.input.keyboard.addKey(Phaser.Keyboard.A),
            right: this.game.input.keyboard.addKey(Phaser.Keyboard.D)
        }

        this.game.input.onDown.add(function () {
            this.attack = this.add.sprite(this.player.x, this.player.y - 48, 'attack');
            this.attack.anchor.setTo(0.5);
            this.game.physics.arcade.enable(this.attack);
            this.game.physics.arcade.overlap(this.attack, this.actors, this.damage, null, this);
            this.attack.destroy();
        }, this);


        this.createItems();
    },

    createItems: function () {
        this.items = this.game.add.group();
        this.items.enableBody = true;

        var item;
        result = this.findObjectsByType('item', this.map, 'objectLayer');
        result.forEach(function (element) {
            this.createFromTiledObject(element, this.items);
        }, this);
    },

    update: function () {
        // Collision
        this.game.physics.arcade.collide(this.actors, this.wallLayer);
        this.game.physics.arcade.collide(this.actors, this.actors);
        this.game.physics.arcade.overlap(this.actors, this.items, this.collect, null, this);

        var speed = 120;
        this.player.body.velocity.y = 0;
        this.player.body.velocity.x = 0;
        if (this.cursors.up.isDown || this.wasd.up.isDown) {
            this.player.body.velocity.y -= speed;
        }
        else if (this.cursors.down.isDown || this.wasd.down.isDown) {
            this.player.body.velocity.y += speed;
        }
        if (this.cursors.left.isDown || this.wasd.left.isDown) {
            this.player.body.velocity.x -= speed;
            this.player.animations.play('leftWalk');
        }
        else if (this.cursors.right.isDown || this.wasd.right.isDown) {
            this.player.body.velocity.x += speed;
            this.player.animations.play('rightWalk');
        }

        if (this.enemy.health < 1) {
            this.enemy.destroy();
        }
    },

    damage: function (weapon, attacked) {
        attacked.health -= 10;
        console.log(attacked.health);
    },

    collect: function (player, chest) {
        chest.destroy();
    },

    // Returns an array of objects of type 'type' from specified layer
    findObjectsByType: function (type, map, layer) {
        var result = new Array();
        map.objects[layer].forEach(function (element) {
            if (element.type === type) {
                element.y -= map.tileHeight;
                result.push(element);
            }
        });
        return result;
    },

    // Adds any properties added to the element in Tiled to its sprite
    createFromTiledObject: function (element, group) {
        var sprite = group.create(element.x, element.y, 'chest');

        if (element.properties) {
            Object.keys(element.properties).forEach(function (key) {
                sprite[key] = element.properties[key];
            });
        }
    },

    // Function for creating player in otherPlayers
    createOtherPlayer: function (playerData) {
        let otherPlayer = this.add.sprite(playerData.xPos, playerData.yPos, 'player');
        otherPlayer.anchor.setTo(0.5);
        otherPlayer.id = playerData.id;
        this.otherPlayers.add(otherPlayer);
        console.log("created " + otherPlayer);
    },

    // Update all other players' positions for Client
    /*
    updateOtherPlayers: function (playerList) {
        playerList.forEach(player => {
            let indexedPlayer = null;
            this.otherPlayers.forEach(otherPlayer => {
                if (player.id === otherPlayer.id) {
                    indexedPlayer = otherPlayer;
                }
            }, this);
            if (indexedPlayer) { // if player exists in otherPlayers
                otherPlayer.x = indexedPlayer.xPos;
                otherPlayer.y = indexedPlayer.yPos;
            } else { // if not, create one
                this.createOtherPlayer(player)
            }
        });
    }*/
}