/* jshint esversion: 6 */
// import game from "./ClientGame.js";

export default class Client {
    constructor(gameInstance) {
        // this.scene = gameInstance.scene.getScene('Dungeon');
        this.game = gameInstance;
        this.socket = io.connect({ reconnection: false });
        this.enteredDungeon = false;

        // Set up WS listeners
        this.socket.on('check', (data) => {
            console.log(data);
        });
        this.socket.on('update', (updatePackage) => {
            console.log('gothere')
            if (this.enteredDungeon) {
                const scene = this.game.scene.get('Dungeon');
                scene.updateBaddies(updatePackage.baddies);
                scene.refreshItems(updatePackage.items);
                scene.updateScore(updatePackage.score);
                scene.updatePlayers(updatePackage.players);
                scene.resetDisconnectTimeout();
            } else {
                // Not ready yet ;)
            }
        });
        this.socket.on('playerUpdate', playerData => {
            if(this.enteredDungeon) {
                const scene = this.game.scene.keys['Dungeon'];
                console.log('About to call updatePlayers')
                scene.updatePlayers(playerData);
                scene.resetDisconnectTimeout();
            }
        })
    }

    joinDungeon(name) {
        this.socket.emit('joinDungeon', name, (dungeon) => {
            if (dungeon) {
                this.game.scene.switch('ServerList', 'Dungeon');
                console.log(this.game)
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

    tryCreateDungeon(name) {
        this.socket.emit('instantiateDungeon', name, (msg) => {
            console.log(msg);
        });
    }

    deleteDungeon(mapName) {
        // TODO: Implement this
        this.socket.emit('closeDungeon', mapName, (msg) => {
            console.log(msg);
        });
    }

    reqServers(serverScene) {
        this.socket.emit('reqServers', "", (list) => {
            serverScene.serverList.setText("Servers: " + list);
        });
    }
}