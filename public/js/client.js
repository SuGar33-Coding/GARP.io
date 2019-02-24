import Dungeon from './states/Dungeon.js'

export default class Client {
    constructor(dungeonState) {
        this.state = dungeonState;
        this.socket = io.connect();

        this.socket.on('check', (data) => {
            console.log(data)
        });
        this.socket.on('update', (updatePackage) => {
            this.state.refreshOtherPlayers(updatePackage.players);
            this.state.updateBaddies(updatePackage.baddies);
        });
    }

    sendPlayer(x, y, xSpear, ySpear, angleSpear) {
        let playerData = {
            xPos: x,
            yPos: y,
            xPosSpear: xSpear,
            yPosSpear: ySpear,
            angleSpear: angleSpear
        }
        this.socket.emit('addPlayerToServer', playerData);
    }

    testFunc() {
        this.socket.emit('test', "Test Went Thru");
    }

    enteredDungeon() {
        this.socket.emit('enterDungeon');
    }

    playerMoved(playerData) {
        this.socket.emit('playerMoved', playerData);
    }
};