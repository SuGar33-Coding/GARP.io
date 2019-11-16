import Boot from './states/Boot.js';
import Preload from './states/Preload.js';
import MainMenu from './states/MainMenu.js';
import Dungeon from './states/Dungeon.js';
import ServerList from './states/ServerList.js';
import Client from './client.js'

class Game extends Phaser.Game {
    constructor() {
        super(window.innerWidth, window.innerHeight, Phaser.AUTO, 'phaser-canvas');
        /* super from the tutorial I used */
        //super(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, Phaser.AUTO);
        this.state.add('Boot', Boot, false);
        this.state.add('Preload', Preload), false;
        this.state.add('MainMenu', MainMenu, false);
        this.state.add('ServerList', ServerList, false);
        this.dungeonState = this.state.add('Dungeon', Dungeon, false);
    }
}

/* For storing the client and Phaser game properties */
const game = new Game();
// construct a new Client object and set as a property of game
game.client = new Client(game.dungeonState);
export default game;

game.state.start('Boot');