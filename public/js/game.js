import Boot from './states/Boot.js';
import Preload from './states/Preload.js';
import MainMenu from './states/MainMenu.js';
import Dungeon from './states/Dungeon.js';

class Game extends Phaser.Game {
    constructor() {
        super(window.innerWidth, window.innerHeight, Phaser.AUTO, 'phaser-canvas');
        /* super from the tutorial I used */
        //super(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, Phaser.AUTO);
        this.state.add('Boot', Boot, false);
        //uncomment these as we create them through the tutorial
        this.state.add('Preload', Preload), false;
        this.state.add('MainMenu', MainMenu, false);
        this.state.add('Dungeon', Dungeon, false);
    }
}

const game = new Game();

game.state.start('Boot');