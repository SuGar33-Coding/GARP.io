import game from "../game.js"

export default class Dungeon extends Phaser.State {
    constructor() {
        super();
        this.spriteScale = 1;
        /* Initializing client here to pass it the Dungeon.this */
        //game.client = new Client(this);
        //console.log(this);
        //console.log("Dungeon constructor ran");
    }

    create() {
        // ======Setting up the map=============

        this.disconnectTimer = setTimeout(() => {
            console.log("Well that escalated quickly");
        }, 2000);

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
        this.spear.exhausted = false; //A bool to check if it has already delt its desired damage after being used 
        this.game.physics.arcade.enable(this.spear);
        this.spear.anchor.setTo(.5);

        /* Send player to Server */
        this.sendPlayerData();
        //this.player.animations.add('rightWalk', [0]);
        //this.player.animations.add('leftWalk',[1]);

        // =========Dealing with other players=======
        this.otherPlayers = this.add.group();
        //console.log(this.otherPlayers);

        // =========Dealing with baddie==============
        this.baddies = this.add.group();
        this.game.physics.arcade.enable(this.baddies);

        /* set spawn point */
        this.baddieSpawnPoint = this.findObjectsByType('enemy', this.map, 'objectLayer');

        //this.enemy = this.add.sprite(this.baddieSpawnPoint[0].x, this.baddieSpawnPoint[0].y, 'baddie');
        //this.enemy.anchor.setTo(.5);
        //this.enemy.health = 30;

        // =========Instantiating groups=============

        /* Group containing all bodies that collide with the world and eachother */
        this.actors = this.game.add.group();
        this.actors.add(this.player);
        this.actors.add(this.otherPlayers);
        //this.actors.add(this.baddies);

        this.items = this.game.add.group();
        this.items.enableBody = true;

        // =========Misc=============================
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
            }, this);
            //this.attack.destroy();
        }, this);


        //this.createItems();

        this.score = this.add.text(0, 0, "Score: 0", {
            fill: "#ffffff"
        });

        this.score.fixedToCamera = true;
        this.score.cameraOffset.setTo(20, 20);

        // ============Start update loop==============
        this.game.client.enteredDungeon();
    }

    update() {
        // Collision
        this.game.physics.arcade.collide(this.actors, this.wallLayer, () => {
            //console.log("something collided with wall");
        });
        this.game.physics.arcade.collide(this.actors, this.actors, () => {
            //console.log("some idiots collided");
        });
        //this.game.physics.arcade.collide(this.player, this.baddies);
        this.game.physics.arcade.overlap(this.player, this.items, this.collect, null, this);

        /* Handle moving player */
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

        if (this.player.positon !== this.player.previousPosition) {
            this.game.client.playerMoved({ xPos: this.player.x, yPos: this.player.y });
        }

        /* Handle moving baddies */
        this.baddies.forEach(baddie => {
            if(baddie.targetPlayerId == this.game.client.socket.id){
                // if(baddie.x < this.player.x){baddie.body.velocity.x += speed/2;}
                // else{baddie.body.velocity.x -= speed/2;}

                // if(baddie.y < this.player.y){baddie.body.velocity.y += speed/2;}
                // else{baddie.body.velocity.y -= speed/2;}
                this.game.physics.arcade.moveToObject(baddie, this.player);

                this.sendBaddieData(baddie);
            }
        },this);
    }

    createItems() {
        this.items = this.game.add.group();
        this.items.enableBody = true;

        var item;
        let result = this.findObjectsByType('item', this.map, 'objectLayer');
        console.log(result);
        result.forEach(function (element) {
            this.createFromTiledObject(element, this.items);
        }, this);
    }

    damage(weapon, attacked) {
        weapon.exhausted = true;
        attacked.health -= 10;
        this.sendBaddieData(attacked);
        console.log(attacked.id + ": " + attacked.health);
    }

    collect(player, item) {
        item.destroy();
        this.items.remove(item);
        this.game.client.itemCollected(item.id);
    }

    /**
     * Returns an array of objects of type 'type' from specified layer
     * @param {*} type 
     * @param {*} map 
     * @param {*} layer 
     */
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
        let spear = otherPlayer.addChild(this.make.sprite(playerData.xPosSpear, playerData.yPosSpear, 'spear'));
        spear.angle = playerData.angleSpear;
        spear.anchor.setTo(.5);

        otherPlayer.id = playerData.id;
        this.otherPlayers.add(otherPlayer);
        this.game.physics.arcade.enable(otherPlayer);
    }

    /**
     * Creates a client-side baddie
     * @param {*} baddieData JSON sent from the server containing all necessary baddie data
     */
    createBaddie(baddieData) {
        let baddie = this.add.sprite(baddieData.xPos, baddieData.yPos, 'baddie');
        baddie.anchor.setTo(.5);
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
    refreshOtherPlayers(playerList) {
        this.otherPlayers.removeAll(true);
        Object.keys(playerList).forEach(id => {
            if (id !== this.game.client.socket.id) {
                this.createOtherPlayer(playerList[id]);
            }
        });
    }

    /**
     * Sends all needed player information to server
     * Since the otherPlayers are fully created every update this is paradigmatically appropriate
     */
    sendPlayerData() {
        this.game.client.sendPlayer(this.player.x, this.player.y, this.spear.x, this.spear.y, this.spear.angle);
    }

    /**
     * Sends all baddie params for one client-side baddie to server
     * NOT paradigmatically apprpriate, but eh
     * @param {*} baddie 
     */
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
                /*
                baddie.x = baddiesList[baddie.id].xPos;
                baddie.y = baddiesList[baddie.id].yPos;
                baddie.health = baddiesList[baddie.id].health;
                */
                //console.log(baddiesList[baddie.id].closest);
                //console.log(baddie.x + ' ' + baddie.y + ' ' + baddie.health);
                baddie.targetPlayerId = baddiesList[baddie.id].targetPlayerId;
                //console.log(Phaser.Math.distance(baddie.x, baddie.y, this.player.x, this.player.y));
                if (Phaser.Math.distance(baddie.x, baddie.y, this.player.x, this.player.y) < 100) {
                    
                    if (baddiesList[baddie.id].targetPlayerId) {
                        //do nothing cause im st00pid - gabe
                    } else {
                        this.game.client.baddieTargetPlayer(baddie.id);
                        baddie.targetPlayerId = this.game.client.socket.id;
                    }
                }
            } else {
                baddie.kill();
                baddie.destroy();
                this.baddies.remove(baddie);
            }
        });
        /* Checks if global server-side baddie is on client yet, if not, add it */
        Object.keys(baddiesList).forEach(id => {
            //console.log(id.instances);
            //console.log(client.socket.id);
            if (baddiesList[id].instances[this.game.client.socket.id]) {
                // It's in the client, and I'm scared of null being false
                // TODO: Test !null
            } else {
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