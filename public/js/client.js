export default class Client {
    constructor() {
        this.socket = io.connect();

        this.socket.on('check', (data) => {
            console.log(data)
        });
        this.socket.on('updatePlayers', (playerList) => {
            //GARP.Dungeon.prototype.updateOtherPlayers(playerList);
            //this.updateOtherPlayers(playerList);
            GARP.Dungeon.updateOtherPlayers(playerList);
        });
    }

    sendPlayer(x, y) {
        playerData = {
            xPos: x,
            yPos: y
        }
        this.socket.emit('addPlayerToServer', playerData);
    }

    testFunc() {
        this.socket.emit('test', "Test Went Thru");
    }

    enteredDungeon() {
        GARP.Client.socket.emit('enterDungeon');
    }

    playerMoved(playerData) {
        GARP.Client.socket.emit('playerMoved', playerData);
    }
};