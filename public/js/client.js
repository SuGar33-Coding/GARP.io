/* jshint esversion: 6 */
import game from "./ClientGame.js";

export default class Client {
    constructor(gameInstance) {
        this.scene = gameInstance.scene.get('Dungeon');
        this.socket = io.connect({ reconnection: false });

        this.socket.on('check', (data) => {
            console.log(data);
        });
        this.socket.on('update', (updatePackage) => {
            this.scene.updatePlayers(updatePackage.players);
            this.scene.updateBaddies(updatePackage.baddies);
            this.scene.refreshItems(updatePackage.items);
            this.scene.updateScore(updatePackage.score);
            this.scene.resetDisconnectTimeout();
        });
    }

    joinDungeon(name) {
        this.socket.emit('joinDungeon', name, (enteredDungeon) => {
            if (enteredDungeon) {
                this.scene.scene.swtich('ServerList');
            } else {
                alert("Dungeon does not exist");
            }
        });
    }

    sendPlayer(x, y, xSpear, ySpear, angleSpear) {
        let playerData = {
            xPos: x,
            yPos: y,
            xPosSpear: xSpear,
            yPosSpear: ySpear,
            angleSpear: angleSpear
        };
        this.socket.emit('addPlayerToServer', playerData);
    }

    sendAttack(directionInRad) {
        this.socket.emit('playerAttack', directionInRad);
    }

    sendMovement(movementJson) {
        this.socket.emit('playerMovement', movementJson);
    }

    sendBaddieData(id, x, y, health) {
        let baddieData = {
            id: id,
            xPos: x,
            yPos: y,
            health: health
        };
        this.socket.emit('updateBaddie', baddieData);
    }

    baddieTargetPlayer(baddieId) {
        this.socket.emit('targetPlayer', baddieId, this.socket.id);
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

    receivedBaddie(baddieData, self) {
        this.socket.emit('receivedBaddie', baddieData, () => {

        });
    }

    itemCollected(itemId) {
        this.socket.emit('itemCollected', itemId);
    }

    tryCreateDungeon(mapData) {
        this.socket.emit('instantiateDungeon', mapData, (msg) => {
            console.log(msg);
        });
    }

    deleteDungeon(mapName) {
        this.socket.emit('closeDungeon', mapName, (msg) => {
            console.log(msg);
        });
    }

    reqServers(self) {
        this.socket.emit('reqServers', "", (list) => {
            self.serverList.setText("Servers: " + list);
        });
    }
}