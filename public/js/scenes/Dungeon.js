/* jshint esversion: 6 */
//import game from "../ClientGame.js/index.js"

export default class Dungeon extends Phaser.Scene {
    constructor() {
        super({
            key: 'Dungeon',
            active: false
        });
        this.spriteScale = 1;
    }

    create() {
        // ======Setting up the map=============

        this.disconnectTimer = setTimeout(() => {
            console.log("Well that escalated quickly");
        }, 2000);

        // Adds a tilemap object to the phaser game so that phaser can read from it
        // this.map = this.game.add.tilemap('dungeon');
        this.map = this.make.tilemap({ key: 'dungeon' });
        // Selects the tilemap you are using.  TODO: After multiple maps are created, select one of the maps.
        this.map.addTilesetImage('DungeonSet', 'gameTiles');

        /* Sets background layer to layer called 'backgroundLayer' inside of the tilemap.
           Should leave these the same for every map for consistency purposes.*/
        // this.backgroundlayer = this.map.createLayer('backgroundLayer');
        this.backgroundlayer = this.map.createStaticLayer('backgroundLayer', 'DungeonSet')

        // this.wallLayer = this.map.createLayer('wallLayer');
        this.wallLayer = this.map.createStaticLayer('wallLayer', 'DungeonSet');

        // Do not need as client no longer checks collision
        // this.map.setCollisionBetween(1, 2000, true, 'wallLayer');

        // this.backgroundlayer.resizeWorld();

        // ========Dealing with spawning player===========
        /* Find spawn points labelled 'playerStart' on the tilemap and place the player sprite there */
        // var playerStarts = this.findObjectsByType('playerStart', this.map, 'objectLayer');
        let playerStarts = this.findObjectsByType('playerStart', this.map, 'objectLayer')
        this.map.getObjectLayer()
        this.player = this.physics.add.sprite(playerStarts[0].x, playerStarts[0].y, 'player')
            .setScale(this.spriteScale);
        this.player.id = this.game.client.socket.id;
        // this.player.smoothed = false;  // If we dont do this it looks like garbo cus of anti aliasing

        // Set Player Speed
        this.playerSpeed = 120;
        // Don't need to check collision
        //this.player.body.collideWorldBounds = true;

        /* Teh SP34R */
        this.player.spear = this.physics.add.sprite(10, 0, 'spear');
        this.player.spear.exhausted = false; //A bool to check if it has already delt its desired damage after being used 
        // TODO: Eventually make it able to do this with any weapon

        /* Send player to Server */
        // sendPlayerData is depracated
        //this.sendPlayerData();

        // Commented out since we do not have animations
        //this.player.animations.add('rightWalk', [0]);
        //this.player.animations.add('leftWalk',[1]);

        // =========Dealing with other players=======
        // Create a group of the other players on the server
        //this.otherPlayers = this.add.group();

        // =========Dealing with baddies==============
        // Create a group of the objects of the baddies and enable physics on them
        this.baddies = this.add.group();
        this.baddiesExist = new Set();

        /* set spawn point */
        // TODO: move this to server side and change it to have multiple spawn points
        this.baddieSpawnPoint = this.findObjectsByType('enemy', this.map, 'objectLayer');

        // =========Instantiating groups=============

        /* Group containing all bodies that collide with the world and eachother */
        // create an actor group that includes all players because this player and otherPlayers are the same when receiving data from server
        this.actors = this.add.group();
        this.actors.add(this.player);
        // No longer need actors group because of collision being moved to server

        this.items = this.add.group(); // picked up by players

        // =========Misc=============================
        this.cameras.main.startFollow(this.player);

        /* set up movement from wasd */
        this.wasd = {
            up: this.input.keyboard.addKey('W'),
            down: this.input.keyboard.addKey('S'),
            left: this.input.keyboard.addKey('A'),
            right: this.input.keyboard.addKey('D')
        }

        // These are the inital values of whether the keys are pressed in or not
        this.leftKeyPressed = false;
        this.rightKeyPressed = false;
        this.upKeyPressed = false;
        this.downKeyPressed = false;

        /* handle player attacking with spear */
        this.input.on('pointerdown', () => {
            var angleInRad = this.game.physics.arcade.angleToPointer(this.player);
            this.sendPlayerAttack(angleInRad);

            // Changing sprite positioning being moved to server side
            /*if ((angleInRad >= -0.3926991) && (angleInRad <= 0.3926991)) { // Attack to the right
                this.spear.angle = 90;
                this.spear.x = (this.player.width / 2);
                this.spear.y = 0; 
                this.sendPlayerAttack()
            } else if ((angleInRad > .3926991) && (angleInRad <= 1.178097)) { // Attack bottom right
                this.spear.angle = 135;
                this.spear.x = this.player.width / 2;
                this.spear.y = this.player.height / 2;
                this.sendPlayerAttack()
            } else if ((angleInRad > 1.178097) && (angleInRad <= 1.9634954)) { // Attack Down
                this.spear.angle = 180;
                this.spear.x = 0;
                this.spear.y = this.player.height / 2;
                this.sendPlayerAttack()
            } else if ((angleInRad > 1.9634954) && (angleInRad <= 2.7488936)) { // Attack Bottom left
                this.spear.angle = 225;
                this.spear.x = -this.player.width / 2;
                this.spear.y = this.player.height / 2;
                this.sendPlayerAttack()
            } else if ((angleInRad > 2.7488936) || (angleInRad <= -2.7488936)) { // Attack Left
                this.spear.angle = 270;
                this.spear.x = -this.player.width / 2;
                this.spear.y = 0;
                this.sendPlayerAttack()
            } else if ((angleInRad > -2.7488936) && (angleInRad <= -1.9634954)) { // Attack Top Left
                this.spear.angle = 315;
                this.spear.x = -this.player.width / 2;
                this.spear.y = -this.player.height / 2;
                this.sendPlayerAttack()
            } else if ((angleInRad > -1.9634954) && (angleInRad <= -1.178097)) { // Attack Up
                this.spear.x = 0;
                this.spear.y = -this.player.height / 2;
                this.sendPlayerAttack()
            } else if ((angleInRad > -1.178097) && (angleInRad <= -0.3926991)) { // Attack top right
                this.spear.angle = 45;
                this.spear.x = this.player.width / 2;
                this.spear.y = -this.player.height / 2;
                this.sendPlayerAttack()
            }*/

            // Movement of sprites moving over to server
            /*this.game.time.events.add(50, function () {
                this.game.physics.arcade.overlap(this.spear, this.baddies, this.damage, () => {
                    return !this.spear.exhausted;
                }, this);
            }, this);
            this.game.time.events.add(300, function () {
                this.spear.angle = 0;
                this.spear.x = 10;
                this.spear.y = 0;
                this.spear.exhausted = false;
                this.sendPlayerData()
            }, this);*/
            //this.attack.destroy();
        })
        // this.game.input.onDown.add(function () {
            
        // }, this);

        /* Initialize score */
        this.score = this.add.text(0, 0, "Score: 0", {
            fill: "#ffffff"
        }).setScrollFactor(1);

        // ============Start update loop==============
        this.game.client.enteredDungeon();
    }

    update() {
        /* Collision */
        // Collision moved to server
        /*this.game.physics.arcade.collide(this.player, this.wallLayer);
        this.game.physics.arcade.collide(this.baddies, this.wallLayer);
        this.game.physics.arcade.collide(this.player, this.baddies);
        this.game.physics.arcade.overlap(this.player, this.items, this.collect, null, this);*/

        /* Handle moving player */
        // These values deprecated by aphi
        /*var speed = 120;
        this.player.body.velocity.y = 0;
        this.player.body.velocity.x = 0;*/

        // this.cursors = this.game.input.keyboard.createCursorKeys();
        /* See if there has been any change in the movement of the player/what keys are being pressed */
        const leftPrevious = this.leftKeyPressed;
        const rightPrevious = this.rightKeyPressed;
        const upPrevious = this.upKeyPressed;
        const downPrevious = this.downKeyPressed;

        this.wasd.up.isDown ? this.upKeyPressed = true : this.upKeyPressed = false;
        this.wasd.down.isDown ? this.downKeyPressed = true : this.downKeyPressed = false;
        this.wasd.left.isDown ? this.leftKeyPressed = true : this.leftKeyPressed = false;
        this.wasd.right.isDown ? this.rightKeyPressed = true : this.rightKeyPressed = false;

        /* Only sends new info if the state of the press has changed */
        if (leftPrevious !== this.leftKeyPressed
            || rightPrevious !== this.rightKeyPressed
            || upPrevious !== this.upKeyPressed
            || downPrevious !== this.downKeyPressed) {
            this.sendPlayerMovement({
                left: this.leftKeyPressed,
                right: this.rightKeyPressed,
                up: this.upKeyPressed,
                down: this.downKeyPressed
            });
        }

        /* Old movement handling 
        if (this.cursors.up.isDown || this.wasd.up.isDown) {
            //this.player.body.velocity.y -= speed;
            sendPlayerMovemnt();
        }
        else if (this.cursors.down.isDown || this.wasd.down.isDown) {
            //this.player.body.velocity.y += speed;
            sendPlayerMovemnt();
        }
        if (this.cursors.left.isDown || this.wasd.left.isDown) {
            //this.player.body.velocity.x -= speed;
            //this.player.animations.play('leftWalk');
            sendPlayerMovemnt();
        }
        else if (this.cursors.right.isDown || this.wasd.right.isDown) {
            //this.player.body.velocity.x += speed;
            //this.player.animations.play('rightWalk');
            sendPlayerMovemnt();
        } 

        if (this.player.positon !== this.player.previousPosition) {
            this.game.client.playerMoved({ xPos: this.player.x, yPos: this.player.y });
        }*/
    }

    // Calculating damage and collecting treasure moved to server side
    /*damage(weapon, attacked) {
        weapon.exhausted = true;
        attacked.health -= 10;
        this.sendBaddieData(attacked);
        console.log(attacked.id + ": " + attacked.health);
    }

    collect(player, item) {
        item.destroy();
        this.items.remove(item);
        this.game.client.itemCollected(item.id);
    }*/

    /**
     * Returns an array of objects of type 'type' from specified layer
     * @param {String} type 
     * @param {Phaser.Tilemaps.ObjectLayer} map 
     * @param {String} layer 
     */
    findObjectsByType(type, map, layer) {
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

    /**
     * Adds any properties added to the element in Tiled to its sprite
     * Used for generic item creation
     * @param {*} element 
     * @param {*} group 
     */
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
        otherPlayer.spear = otherPlayer.addChild(this.make.sprite(playerData.xPosSpear, playerData.yPosSpear, 'spear'));
        otherPlayer.spear.angle = playerData.angleSpear;
        otherPlayer.spear.anchor.setTo(.5);

        otherPlayer.id = playerData.id;
        this.actors.add(otherPlayer);
        this.game.physics.arcade.enable(otherPlayer);
    }

    /**
     * Creates a client-side baddie
     * @param {*} baddieData JSON sent from the server containing all necessary baddie data
     */
    createBaddie(baddieData) {
        console.log("Creating baddie: " + baddieData.id);
        let baddie = this.add.sprite(baddieData.xPos, baddieData.yPos, 'baddie');
        baddie.anchor.setTo(.5);

        // Unneeded data, deprecated by APHI
        baddie.health = baddieData.health;
        baddie.id = baddieData.id;
        baddie.targetPlayerId = baddieData.targetPlayerId;

        this.game.physics.arcade.enable(baddie);
        this.baddies.add(baddie);
        //this.game.physics.arcade.enable(this.baddies)
        //this.actors.add(baddie)
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
            if (id !== this.game.client.socket.id) {
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
    // Deprecated by APHI
    refreshOtherPlayers(playerList) {
        this.otherPlayers.removeAll(true);
        Object.keys(playerList).forEach(id => {
            if (id !== this.game.client.socket.id) {
                this.createOtherPlayer(playerList[id]);
            }
        });
    }

    updatePlayers(playerList) {

        this.actors.forEach(actor => { // If it does, update its params
            if (playerList[actor.id]) {

                // Update player position to whatever the server is telling us it is
                actor.x = playerList[actor.id].xPos;
                actor.y = playerList[actor.id].yPos;
                actor.spear.x = playerList[actor.id].xPosSpear;
                actor.spear.y = playerList[actor.id].yPosSpear;

            } else { // player is stale/ded
                actor.kill();
                actor.destroy();
                this.actors.remove(actor);
            }
        });
        /* Checks if global server-side player is on client yet, if not, add it */
        Object.keys(playerList).forEach(id => {
            if (this.actors[id]) {
                // It's in the client, and I'm scared of null being false
                // TODO: Figure out JS bool evals
            } else {
                this.createOtherPlayer(playerList[id]);
            }
        });
    }

    sendPlayerAttack(directionInRad) {
        this.game.client.sendAttack(directionInRad);
    }

    sendPlayerMovement(movementJson) {
        this.game.client.sendMovement(movementJson);
    }

    /**
     * Sends all needed player information to server
     * Since the otherPlayers are fully created every update this is paradigmatically appropriate
     */
    // Should no longer be used due to APHI
    sendPlayerData() {
        this.game.client.sendPlayer(this.player.x, this.player.y, this.player.spear.x, this.player.spear.y, this.player.spear.angle);
    }

    /**
     * Sends all baddie params for one client-side baddie to server
     * NOT paradigmatically apprpriate, but eh
     * @param {*} baddie 
     */
    // Deprecated by APHI
    sendBaddieData(baddie) {
        this.game.client.sendBaddieData(baddie.id, baddie.x, baddie.y, baddie.health);
    }

    /**
     * Updates existing client-side baddies and adds new ones
     * @param {*} baddiesList 
     */
    updateBaddies(baddiesList) {
        /* Checks if client-side baddie exists on the server, if not, kill it */
        this.baddies.forEach(baddie => { // If it does, update its params
            if (baddiesList[baddie.id]) {

                // Update baddie position to whatever the server is telling us it is
                baddie.x = baddiesList[baddie.id].xPos;
                baddie.y = baddiesList[baddie.id].yPos;
                // TODO: Add attack animations with some value like "is attacking"

                /* Handle moving the baddie the case of being the target or someone else being the target */
                // All client handling of baddie deprecated by APHI

                /*baddie.targetPlayerId = baddiesList[baddie.id].targetPlayerId;
                if (baddie.targetPlayerId == this.game.client.socket.id) {
                    this.game.physics.arcade.moveToObject(baddie, this.player);
                    this.sendBaddieData(baddie);
                } else {
                    baddie.x = baddiesList[baddie.id].xPos;
                    baddie.y = baddiesList[baddie.id].yPos;
                }*/
                /* Setting the targeted player when within the distance */
                /*if (Phaser.Math.distance(baddie.x, baddie.y, this.player.x, this.player.y) < 100) {

                    if (baddiesList[baddie.id].targetPlayerId) {
                        //TODO: learn more about boolean evals in JS
                        //do nothing cause im st00pid - gabe
                    } else {
                        this.game.client.baddieTargetPlayer(baddie.id);
                        baddie.targetPlayerId = this.game.client.socket.id;
                    }
                }*/
            } else { // baddie is stale/ded
                baddie.kill();
                baddie.destroy();
                this.baddies.remove(baddie);
            }
        });
        /* Checks if global server-side baddie is on client yet, if not, add it */
        Object.keys(baddiesList).forEach(id => {
            if (this.baddiesExist.has(id)) {
                // It's in the client, and I'm scared of null being false
                // TODO: Figure out JS bool evals
            } else {
                this.baddiesExist.add(id);
                this.createBaddie(baddiesList[id]);
                this.game.client.receivedBaddie(baddiesList[id], this);
            }
        });
    }

    refreshItems(itemList) {
        this.items.removeAll(true);
        Object.keys(itemList).forEach(id => {
            let itemData = itemList[id];
            let item = this.items.create(itemData.xPos, itemData.yPos, 'chest');
            item.id = id;
            // TODO: Handle other types of items than just chests
        });
    }

    updateScore(score) {
        this.score.setText("Score: " + score);
    }

    tryCreateDungeon() {
        let map = this.game.add.tilemap('dungeon');
        map.addTilesetImage('DungeonSet', 'gameTiles');

        let itemsArray = []

        this.findObjectsByType('item', map, 'objectLayer').forEach(itemData => {
            itemsArray.push({
                xPos: itemData.x,
                yPos: itemData.y,
                properties: itemData.properties
            })
        });

        let mapData = {
            name: 'dungeon1',
            baddieSpawnPoint: this.findObjectsByType('enemy', map, 'objectLayer')[0],
            itemsArray: itemsArray
        }

        this.game.client.tryCreateDungeon(mapData);
    }

    resetDisconnectTimeout() {
        clearTimeout(this.disconnectTimer);
        this.disconnectTimer = setTimeout(() => {
            this.state.start('MainMenu', true, true);
        }, 2000);
    }

    /**
     * For debug info
     */
    render() {
        //this.game.debug.cameraInfo(this.camera, 32, 32);
    }
}