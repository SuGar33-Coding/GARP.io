/** @type {import("../../defs/phaser")} */
import Boot from './scenes/Boot.js';
import Preload from './scenes/Preload.js';
import MainMenu from './scenes/MainMenu.js';
import Dungeon from './scenes/Dungeon.js';
import ServerList from './scenes/ServerList.js';

// class Game extends Phaser.Game {
//     constructor() {
//         super(window.innerWidth, window.innerHeight, Phaser.AUTO, 'phaser-canvas');
//         /* super from the tutorial I used */
//         //super(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, Phaser.AUTO);
//         this.state.add('Boot', Boot, false);
//         this.state.add('Preload', Preload, false);
//         this.state.add('MainMenu', MainMenu, false);
//         this.state.add('ServerList', ServerList, false);
//         this.dungeonState = this.state.add('Dungeon', Dungeon, false);
//     }
// }

var config = {
    type: Phaser.AUTO,
    // width: window.innerWidth,
    // height: window.innerHeight,
    // parent: 'phaser-canvas',
    backgroundColor: '#000',
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'phaser-canvas',
        width: 800,
        height: 600
    },
    physics: {
        default: 'arcade',
        arcade: {
            fps: 60,
            gravity: { y: 0 }
        }
    },
    // I recommend removing scenes from this and adding them back one by one when upgrading to Phaser 3
    // NOTE: They are prioritzied in reverse order
    // NOTE: Yeah I don't think they are
    // scene: [ServerList, MainMenu, Preload, Boot]
    scene: [Boot, Preload, MainMenu, ServerList, Dungeon]
};

/* For storing the client and Phaser game properties */
const game = new Phaser.Game(config);

// export default game;