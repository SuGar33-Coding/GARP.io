import Client from '../client.js'

export default class Dungeon extends Phaser.State {
    constructor() {
        super();
        this.spriteScale = 2;
        this.client = new Client(this);
    }

    create() {
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
        this.player.scale.setTo(this.spriteScale);
        this.player.smoothed = false;  // If we dont do this it looks like garbo cus of anti aliasing

        this.game.physics.arcade.enable(this.player);
        this.playerSpeed = 120;
        this.player.body.collideWorldBounds = true;

        /* Teh SP34R */
        this.spear = this.player.addChild(this.make.sprite(10, 0, 'spear'));
        this.game.physics.arcade.enable(this.spear);
        this.spear.anchor.setTo(.5);

        /* Send player to Server */
        this.sendPlayerData();
        //this.player.animations.add('rightWalk', [0]);
        //this.player.animations.add('leftWalk',[1]);

        // =========Dealing with other players=========
        this.otherPlayers = this.add.group();
        //console.log(this.otherPlayers);

        // =========Dealing with baddie==============
        this.baddies = this.add.group();

        /* set spawn point */
        this.baddieSpawnPoint = this.findObjectsByType('enemy', this.map, 'objectLayer');

        //this.enemy = this.add.sprite(this.baddieSpawnPoint[0].x, this.baddieSpawnPoint[0].y, 'baddie');
        //this.enemy.anchor.setTo(.5);
        //this.enemy.health = 30;

        //this.actors = this.game.add.group();
        this.game.physics.arcade.enable(this.player);
        //this.actors.add(this.enemy);
        //this.game.physics.arcade.enable(this.actors);

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
                this.spear.x = (this.player.width / 2);
                this.spear.y = 0;
                this.sendPlayerData()
            } else if ((angleInRad > .3926991) && (angleInRad <= 1.178097)) { // Attack bottom right
                this.spear.angle = 135;
                this.spear.x = this.player.width / 2;
                this.spear.y = this.player.height / 2;
                this.sendPlayerData()
            } else if ((angleInRad > 1.178097) && (angleInRad <= 1.9634954)) { // Attack Down
                this.spear.angle = 180;
                this.spear.x = 0;
                this.spear.y = this.player.height / 2;
                this.sendPlayerData()
            } else if ((angleInRad > 1.9634954) && (angleInRad <= 2.7488936)) { // Attack Bottom left
                this.spear.angle = 225;
                this.spear.x = -this.player.width / 2;
                this.spear.y = this.player.height / 2;
                this.sendPlayerData()
            } else if ((angleInRad > 2.7488936) || (angleInRad <= -2.7488936)) { // Attack Left
                this.spear.angle = 270;
                this.spear.x = -this.player.width / 2;
                this.spear.y = 0;
                this.sendPlayerData()
            } else if ((angleInRad > -2.7488936) && (angleInRad <= -1.9634954)) { // Attack Top Left
                this.spear.angle = 315;
                this.spear.x = -this.player.width / 2;
                this.spear.y = -this.player.height / 2;
                this.sendPlayerData()
            } else if ((angleInRad > -1.9634954) && (angleInRad <= -1.178097)) { // Attack Up
                this.spear.x = 0;
                this.spear.y = -this.player.height / 2;
                this.sendPlayerData()
            } else if ((angleInRad > -1.178097) && (angleInRad <= -0.3926991)) { // Attack top right
                this.spear.angle = 45;
                this.spear.x = this.player.width / 2;
                this.spear.y = -this.player.height / 2;
                this.sendPlayerData()
            }

            this.game.time.events.add(50, function () {
                this.game.physics.arcade.overlap(this.spear, this.baddies, this.damage, null, this);
            }, this);

            this.game.time.events.add(300, function () {
                this.spear.angle = 0;
                this.spear.x = 10;
                this.spear.y = 0;
                this.sendPlayerData()
            }, this);
            //this.attack.destroy();
        }, this);


        this.createItems();

        // ============Start update loop==============
        this.client.enteredDungeon();
    }

    createItems() {
        this.items = this.game.add.group();
        this.items.enableBody = true;

        var item;
        let result = this.findObjectsByType('item', this.map, 'objectLayer');
        result.forEach(function (element) {
            this.createFromTiledObject(element, this.items);
        }, this);
    }

    update() {
        // Collision
        this.game.physics.arcade.collide(this.player, this.wallLayer);
        this.game.physics.arcade.collide(this.baddies, this.wallLayer);
        //this.game.physics.arcade.collide(this.actors, this.actors);
        this.game.physics.arcade.collide(this.player, this.baddies);
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

        /*
        this.baddies.forEach(baddie => {
            if (baddie.health <1) {
                baddie.kill;
                baddie.destroy;
                baddies.remove(baddie);
            };
        }); */

        if (this.player.positon !== this.player.previousPosition) {
            this.client.playerMoved({ xPos: this.player.x, yPos: this.player.y });
        }
    }

    damage(weapon, attacked) {
        attacked.health -= 10;
        this.sendBaddieData(attacked);
        console.log(attacked.id + ": " + attacked.health);
    }

    collect(player, chest) {
        chest.destroy();
    }

    // Returns an array of objects of type 'type' from specified layer
    findObjectsByType(type, map, layer) {
        var result = new Array();
        map.objects[layer].forEach(function (element) {
            if (element.type === type) {
                element.y -= map.tileHeight;
                result.push(element);
            }
        });
        return result;
    }

    // Adds any properties added to the element in Tiled to its sprite
    createFromTiledObject(element, group) {
        var sprite = group.create(element.x, element.y, 'chest');

        if (element.properties) {
            Object.keys(element.properties).forEach(function (key) {
                sprite[key] = element.properties[key];
            });
        }
    }

    /**
     * Creates a client-side sprite of another player that's on the same server
     * @param {*} playerData 
     */
    createOtherPlayer(playerData) {
        /* Give their position */
        let otherPlayer = this.add.sprite(playerData.xPos, playerData.yPos, 'player');
        otherPlayer.anchor.setTo(0.5);
        otherPlayer.scale.setTo(this.spriteScale);

        /* Give em a spear */
        let spear = otherPlayer.addChild(this.make.sprite(playerData.xPosSpear, playerData.yPosSpear, 'spear'));
        spear.angle = playerData.angleSpear;
        spear.anchor.setTo(.5);

        otherPlayer.id = playerData.id;
        this.otherPlayers.add(otherPlayer);
        //console.log("created " + otherPlayer);
    }

    /**
     * Creates a client-side baddie
     * @param {*} baddieData JSON sent from the server containing all necessary baddie data
     */
    createBaddie(baddieData) {
        let baddie = this.add.sprite(this.baddieSpawnPoint[0].x + baddieData.xPos, this.baddieSpawnPoint[0].y + baddieData.yPos, 'baddie');
        baddie.anchor.setTo(.5);
        baddie.health = baddieData.health;
        baddie.id = baddieData.id;
        this.baddies.add(baddie);
        this.game.physics.arcade.enable(this.baddies);
    }

    /**
     * Is called every time the server sends update information
     * Simply updates non-client player positions
     * 
     * refreshOtherPlayers is currently being used instead
     * @param {id: {id: id, xPos: x, yPos: y}} playerList 
     */
    updateOtherPlayers(playerList) {
        Object.keys(playerList).forEach(id => {
            if (id !== this.client.socket.id) {
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

    /**
     * Keeps other players fully consistent with the player list on the server
     * Destroys existing sprites and Creates sprites for each update
     * @param {*} playerList 
     */
    refreshOtherPlayers(playerList) {
        this.otherPlayers.removeAll(true);
        Object.keys(playerList).forEach(id => {
            if (id !== this.client.socket.id) {
                this.createOtherPlayer(playerList[id]);
            }
        });
    }

    /**
     * Sends all needed player information to server
     * Since the otherPlayers are fully created every update this is paradigmatically appropriate
     */
    sendPlayerData() {
        this.client.sendPlayer(this.player.x, this.player.y, this.spear.x, this.spear.y, this.spear.angle);
    }

    /**
     * Sends all baddie params for one client-side baddie to server
     * NOT paradigmatically apprpriate, but eh
     * @param {*} baddie 
     */
    sendBaddieData(baddie) {
        this.client.sendBaddieData(baddie.id, baddie.x - this.baddieSpawnPoint[0].x, baddie.y - this.baddieSpawnPoint[0].y, baddie.health);
    }

    /**
     * Updates existing client-side baddies and adds new ones
     * @param {*} baddiesList 
     */
    updateBaddies(baddiesList) {
        /* Checks if client-side baddie exists on the server, if not, kill it */
        this.baddies.forEach(baddie => { // If it does, update its params
            if (baddiesList[baddie.id]) {
                baddie.x = this.baddieSpawnPoint[0].x + baddiesList[baddie.id].xPos;
                baddie.y = this.baddieSpawnPoint[0].y + baddiesList[baddie.id].yPos;
                baddie.health = baddiesList[baddie.id].health;
                //console.log(baddie.x + ' ' + baddie.y + ' ' + baddie.health);
            } else {
                baddie.kill();
                baddie.destroy();
                this.baddies.remove(baddie);
            }
        });
        /* Checks if global server-side baddie is on client yet, if not, add it */
        Object.keys(baddiesList).forEach(id => {
            //console.log(id.instances);
            //console.log(this.client.socket.id);
            if (baddiesList[id].instances[this.client.socket.id]) {
                // It's in the client, and I'm scared of null being false
                // TODO: Test !null
            } else {
                this.createBaddie(baddiesList[id]);
                this.client.receivedBaddie(baddiesList[id]);
            }
        });
    }
}