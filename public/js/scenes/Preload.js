/** @type {import("../../../defs/phaser")} */
export default class Preload extends Phaser.Scene {
    constructor () {
		super({
			key: 'Preload',
			active: false
		});
	}

    preload() {
        this.title = this.add.image(this.game.world.centerX, this.game.world.centerY, 'title');

        this.loadbar = this.add.image(this.game.world.centerX, this.game.world.centerY + 128, 'loadbar');

        this.load.setPreloadSprite(this.loadbar);

        // load game assets here

        this.load.spritesheet('player','assets/sprites/Player2.png',38,64);
        this.load.spritesheet('attack','assets/sprites/attack.png',16,16);
        this.load.spritesheet('spear','assets/sprites/spear.png',5,57);
        this.load.spritesheet('baddie','assets/sprites/baddie.png');
        this.load.spritesheet('baddieHurt','assets/sprites/baddieHurt.png');
        this.load.spritesheet('chest','assets/sprites/chest.png');
        this.load.spritesheet('zombie','assets/sprites/zombie.png');
        this.load.spritesheet('playButton', 'assets/images/BetterPlayButton.png');
        this.load.spritesheet('createButton', 'assets/images/createButton.png');
        this.load.spritesheet('joinButton', 'assets/images/joinButton.png');
        this.load.spritesheet('deleteButton', 'assets/images/deleteButton.png');
        this.load.spritesheet('refreshButton', 'assets/images/refreshButton.png');
        this.load.tilemap('dungeon','assets/tilemaps/TileMap.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.image('gameTiles', 'assets/tilemaps/DungeonTileSet.png');
        console.log("Loaded in erything");
        // TODO: Move out map preloading to dungeon for when we have multiple maps to choose from
    }

    create() {
        this.scene.switch('MainMenu');
    }
};