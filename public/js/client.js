import Dungeon from './states/Dungeon.js'

export default class Client {
    constructor(dungeonState) {
        this.state = dungeonState;
        this.socket = io.connect();

        this.socket.on('check', (data) => {
            console.log(data)
        });
        this.socket.on('updatePlayers', (playerList) => {
            this.state.updateOtherPlayers(playerList);
        });
    }

    sendPlayer(x, y) {
        let playerData = {
            xPos: x,
            yPos: y
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