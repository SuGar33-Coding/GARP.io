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
        this.state.add('Preload', Preload), false;
        this.state.add('MainMenu', MainMenu, false);
        this.state.add('Dungeon', Dungeon, false);
    }
}

/* For storing the client */
export default {

};

const game = new Game();

game.state.start('Boot');