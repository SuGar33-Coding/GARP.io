var GARP = GARP || {};

GARP.Dungeon = {

    create: function () {
        // ======Setting up the map=============

        this.map = this.game.add.tilemap('dungeon');

        this.map.addTilesetImage('DungeonSet', 'gameTiles');

        this.backgroundlayer = this.map.createLayer('backgroundLayer');
        this.wallLayer = this.map.createLayer('wallLayer');

        this.map.setCollisionBetween(1, 2000, true, 'wallLayer');

        this.backgroundlayer.resizeWorld();

        // ========Dealing with player===========
        var playerStarts = this.findObjectsByType('playerStart', this.map, 'objectLayer');
        this.player = this.add.sprite(playerStarts[0].x, playerStarts[0].y, 'player');
        this.player.anchor.setTo(.5);
        this.player.scale.setTo(2)
        this.player.smoothed = false;  // If we dont do this it looks like garbo cus of anti aliasing

        this.game.physics.arcade.enable(this.player);
        this.playerSpeed = 120;
        this.player.body.collideWorldBounds = true;

        this.spear = this.player.addChild(this.make.sprite(10,0,'spear'));
        this.game.physics.arcade.enable(this.spear);
        this.spear.anchor.setTo(.5);

        //this.player.animations.add('rightWalk', [0]);
        //this.player.animations.add('leftWalk',[1]);

        // =========Dealing with baddie=============
        GARP.Client.sendPlayer(this.player.x, this.player.y);
        //GARP.Client.testFunc();
        //console.log(this.player.position);

        // =========Dealing with other players=========
        this.otherPlayers = this.add.group();
        //console.log(this.otherPlayers);

        // =========Dealing with baddie==============
        var baddieStarts = this.findObjectsByType('enemy', this.map, 'objectLayer');
        this.enemy = this.add.sprite(baddieStarts[0].x, baddieStarts[0].y, 'baddie');
        this.enemy.anchor.setTo(.5);
        this.enemy.health = 30;

        this.actors = this.game.add.group();
        this.game.physics.arcade.enable(this.player);
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
            var angleInRad = this.game.physics.arcade.angleToPointer(this.player)

            if ((angleInRad >= -0.3926991) && (angleInRad <= 0.3926991)) { // Attack to the right
                this.spear.angle = 90;
                this.spear.x = (this.player.width/2);
                this.spear.y = 0;
            } else if ((angleInRad > .3926991) && (angleInRad <= 1.178097)) { // Attack bottom right
                this.spear.angle = 135;
                this.spear.x = this.player.width/2;
                this.spear.y = this.player.height/2;
            } else if ((angleInRad > 1.178097) && (angleInRad <= 1.9634954)) { // Attack Down
                this.spear.angle = 180;
                this.spear.x = 0;
                this.spear.y = this.player.height/2;
            } else if ((angleInRad > 1.9634954) && (angleInRad <= 2.7488936)) { // Attack Bottom left
                this.spear.angle = 225;
                this.spear.x = -this.player.width/2;
                this.spear.y = this.player.height/2;
            } else if ((angleInRad > 2.7488936) || (angleInRad <= -2.7488936)) { // Attack Left
                this.spear.angle = 270;
                this.spear.x = -this.player.width/2;
                this.spear.y = 0;
            } else if ((angleInRad > -2.7488936) && (angleInRad <= -1.9634954)) { // Attack Top Left
                this.spear.angle = 315;
                this.spear.x = -this.player.width/2;
                this.spear.y = -this.player.height/2;
            } else if ((angleInRad > -1.9634954) && (angleInRad <= -1.178097)) { // Attack Up
                this.spear.x = 0;
                this.spear.y = -this.player.height/2;
            } else if ((angleInRad > -1.178097) && (angleInRad <= -0.3926991)) { // Attack top right
                this.spear.angle = 45;
                this.spear.x = this.player.width/2;
                this.spear.y = -this.player.height/2;
            }

            this.game.time.events.add(50, function(){
                this.game.physics.arcade.overlap(this.spear, this.actors, this.damage, null, this);
            },this);
            
            this.game.time.events.add(300, function(){
                this.spear.angle = 0;
                this.spear.x = 10;
                this.spear.y = 0;
            },this);
            //this.attack.destroy();
        }, this);


        this.createItems();

        // ============Start update loop==============
        GARP.Client.enteredDungeon();
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
        this.game.physics.arcade.collide(this.player, this.wallLayer);
        this.game.physics.arcade.collide(this.actors, this.wallLayer);
        this.game.physics.arcade.collide(this.actors, this.actors);
        this.game.physics.arcade.collide(this.player, this.actors);
        this.game.physics.arcade.overlap(this.player, this.items, this.collect, null, this);

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
            //this.player.animations.play('leftWalk');
        }
        else if (this.cursors.right.isDown || this.wasd.right.isDown) {
            this.player.body.velocity.x += speed;
            //this.player.animations.play('rightWalk');
        }

        if (this.enemy.health < 1) {
            this.enemy.destroy();
        }

        if (this.player.positon !== this.player.previousPosition) {
            GARP.Client.playerMoved({xPos: this.player.x, yPos: this.player.y});
        }
    },

    damage: function (weapon, attacked) {
        attacked.health -= 10;
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

    /**
     * Is called every time the server sends update information
     * Simply updates non-client player positions
     * @param {id: {id: id, xPos: x, yPos: y}} playerList 
     */
    updateOtherPlayers: function (playerList) {
        Object.keys(playerList).forEach(id => {
            if (id !== GARP.Client.socket.id) {
                let indexedPlayer = null;
                this.otherPlayers.forEach(otherPlayer => {
                    if (id === otherPlayer.id) {
                        indexedPlayer = otherPlayer; // grab an instance of the player referred by the id
                    }
                }, this);
                if (indexedPlayer) { // if player exists in otherPlayers, change its Pos
                    indexedPlayer.x = playerList[id].xPos;
                    indexedPlayer.y = playerList[id].yPos;
                } else { // if not, create one
                    this.createOtherPlayer(playerList[id]);
                }
            }
        });
    }
}