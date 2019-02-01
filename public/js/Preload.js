var GARP = GARP || {};

GARP.Preload = function(){};

GARP.Preload.prototype = {

    preload: function() {
        this.title = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'title');
        this.title.anchor.setTo(0.5);
        this.title.scale.setTo(2);

        this.loadbar = this.add.sprite(this.game.world.centerX, this.game.world.centerY + 128, 'loadbar');
        this.loadbar.anchor.setTo(0.5);

        this.load.setPreloadSprite(this.loadbar);

        // load game assets here

        this.load.spritesheet('player','assets/sprites/Player2.png',38,64);
        this.load.spritesheet('attack','assets/sprites/attack.png',16,16);
        this.load.spritesheet('spear','assets/sprites/spear.png',5,57);
        this.load.spritesheet('baddie','assets/sprites/baddie.png');
        this.load.spritesheet('baddieHurt','assets/sprites/baddieHurt.png');
        this.load.spritesheet('chest','assets/sprites/chest.png');
        this.load.spritesheet('zombie','assets/sprites/zombie.png');
        this.load.spritesheet('playButton', 'assets/images/playButton.png');
        this.load.tilemap('dungeon','assets/tilemaps/TileMap.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.image('gameTiles', 'assets/tilemaps/DungeonTileSet.png');
    },

    create: function() {
        this.state.start('MainMenu');
    }
};