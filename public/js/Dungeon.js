GARP.Dungeon = function () { };

GARP.Dungeon.prototype = {

    create: function () {

        // Setting up the map

        
        this.map = this.game.add.tilemap('dungeon');
        

        this.map.addTilesetImage('DungeonSet','gameTiles');

        this.backgroundlayer = this.map.createLayer('backgroundLayer');
        this.wallLayer = this.map.createLayer('wallLayer');

        this.map.setCollisionBetween(1,2000,true, 'wallLayer');

        this.backgroundlayer.resizeWorld();

        // Dealing with player
        var result = this.findObjectsByType('playerStart', this.map, 'objectLayer');
        this.player = this.add.sprite(result[0].x, result[0].y, 'player');
        this.player.anchor.setTo(.5);

        this.game.physics.arcade.enable(this.player);
        this.playerSpeed = 120;
        this.player.body.collideWorldBounds = true;

        this.player.animations.add('rightWalk', [0]);
        this.player.animations.add('leftWalk',[1]);

        //this.game.world.setBounds(0, 0, 1000, 1000);

        this.game.camera.follow(this.player);

        this.cursors = this.game.input.keyboard.createCursorKeys();

        this.wasd = {
            up: this.game.input.keyboard.addKey(Phaser.Keyboard.W),
            down: this.game.input.keyboard.addKey(Phaser.Keyboard.S),
            left: this.game.input.keyboard.addKey(Phaser.Keyboard.A),
            right: this.game.input.keyboard.addKey(Phaser.Keyboard.D)
        }


        this.createItems();
    },

    createItems: function() {
        this.items = this.game.add.group();
        this.items.enableBody = true;

        var item;
        result = this.findObjectsByType('item', this.map, 'objectLayer');
        result.forEach(function(element){
            this.createFromTiledObject(element,this.items);
        }, this);
    },

    update: function () {
        var speed = 120;
        this.player.body.velocity.y = 0;
        this.player.body.velocity.x = 0;
        if (this.cursors.up.isDown||this.wasd.up.isDown) {
            this.player.body.velocity.y -= speed;
        }
        else if (this.cursors.down.isDown||this.wasd.down.isDown) {
            this.player.body.velocity.y += speed;
        }
        if (this.cursors.left.isDown||this.wasd.left.isDown) {
            this.player.body.velocity.x -= speed;
            this.player.animations.play('leftWalk');
        }
        else if (this.cursors.right.isDown||this.wasd.right.isDown) {
            this.player.body.velocity.x += speed;
            this.player.animations.play('rightWalk');
        }

        // Collision
        this.game.physics.arcade.collide(this.player, this.wallLayer);
        this.game.physics.arcade.overlap(this.player, this.items, this.collect, null, this);
    },

    collect: function(player,chest) {
        console.log('ez munee');

        chest.destroy();
    },

    // Returns an array of objects of type 'type' from specified layer
    findObjectsByType: function(type, map, layer) {
        var result = new Array();
        map.objects[layer].forEach(function(element){
          if(element.type === type) {
              console.log(element.type);
            element.y -= map.tileHeight;
            result.push(element);
          }      
        });
        return result;
      },

    // Adds any properties added to the element in Tiled to its sprite
    createFromTiledObject: function(element, group){
        var sprite = group.create(element.x, element.y, 'chest');

        if(element.properties){
            Object.keys(element.properties).forEach(function(key){
                sprite[key] = element.properties[key];
            });
        }
    }
}