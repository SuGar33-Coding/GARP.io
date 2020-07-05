/** @type {import("../../../defs/phaser")} */
export default class Preload extends Phaser.Scene {
    constructor() {
        super({
            key: 'Preload',
            active: false
        });
    }

    preload() {
        const self = this;

        let progressBar = this.add.graphics();
        let progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(240, 270, 320, 50);

        this.load.on('progress', function (value) {
            // console.log(value);
        });

        this.load.on('fileprogress', function (file) {
            // console.log(file.src);
        });

        this.load.on('complete', () => {
            console.log('complete');
            self.scene.switch('MainMenu');
        });

        this.load.on('progress', function (value) {
            // console.log(value);
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(250, 280, 300 * value, 30);
        });

        this.title = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'title');

        // this.loadbar = this.add.image(this.cameras.main.centerX, this.cameras.main.centerX + 128, 'loadbar');

        this.load.image('yeet', 'assets/sprites/Player2.png');
        for (var i = 0; i < 500; i++) {
            this.load.image('yeet' + i, 'assets/sprites/Player2.png');
        }

        // this.load.setPreloadSprite(this.loadbar);

        // load game assets here

        this.load.image('player', 'assets/sprites/Player2.png');
        this.load.image('attack', 'assets/sprites/attack.png');
        this.load.image('spear', 'assets/sprites/spear.png');
        this.load.image('baddie', 'assets/sprites/baddie.png');
        this.load.image('baddieHurt', 'assets/sprites/baddieHurt.png');
        this.load.image('chest', 'assets/sprites/chest.png');
        this.load.image('zombie', 'assets/sprites/zombie.png');
        this.load.image('playButton', 'assets/images/BetterPlayButton.png');
        this.load.image('createButton', 'assets/images/createButton.png');
        this.load.image('joinButton', 'assets/images/joinButton.png');
        this.load.image('deleteButton', 'assets/images/deleteButton.png');
        this.load.image('refreshButton', 'assets/images/refreshButton.png');
        // this.load.tilemap('dungeon','assets/tilemaps/TileMap.json', null, Phaser.Tilemap.TILED_JSON);
        // this.load.image('gameTiles', 'assets/tilemaps/DungeonTileSet.png');
        // TODO: Move out map preloading to dungeon for when we have multiple maps to choose from
    }

    create() {
    }
};