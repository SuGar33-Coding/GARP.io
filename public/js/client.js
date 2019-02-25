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
            this.state.refreshItems(updatePackage.items);
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

    sendBaddieData(id, x, y, health) {
        let baddieData = {
            id: id,
            xPos: x,
            yPos: y,
            health: health
        }
        this.socket.emit('updateBaddie', baddieData);
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

    receivedBaddie(baddieData) {
        this.socket.emit('receivedBaddie', baddieData);
    }

    itemCollected(itemId) {
        this.socket.emit('itemCollected', itemId);
    }
};