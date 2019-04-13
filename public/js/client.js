import game from "./game.js"

export default class Client {
    constructor(dungeonState) {
        this.state = dungeonState;
        this.socket = io.connect({reconnection: false});

        this.socket.on('check', (data) => {
            console.log(data)
        });
        this.socket.on('update', (updatePackage) => {
            this.state.refreshOtherPlayers(updatePackage.players);
            this.state.updateBaddies(updatePackage.baddies);
            this.state.refreshItems(updatePackage.items);
            this.state.updateScore(updatePackage.score);
            this.state.resetDisconnectTimeout();
        });
    };

    joinDungeon(name) {
        this.socket.emit('joinDungeon', name, (enteredDungeon) => {
            if (enteredDungeon) {
                game.state.start('Dungeon');
            } else {
                alert("Dungeon does not exist");
            }
        });
    };

    sendPlayer(x, y, xSpear, ySpear, angleSpear) {
        let playerData = {
            xPos: x,
            yPos: y,
            xPosSpear: xSpear,
            yPosSpear: ySpear,
            angleSpear: angleSpear
        }
        this.socket.emit('addPlayerToServer', playerData);
    };

    sendBaddieData(id, x, y, health) {
        let baddieData = {
            id: id,
            xPos: x,
            yPos: y,
            health: health
        }
        this.socket.emit('updateBaddie', baddieData);
    };

    baddieTargetPlayer(baddieId) {
        this.socket.emit('targetPlayer', baddieId, this.socket.id);
    }

    testFunc() {
        this.socket.emit('test', "Test Went Thru");
    };

    enteredDungeon() {
        this.socket.emit('enterDungeon');
    };

    playerMoved(playerData) {
        this.socket.emit('playerMoved', playerData);
    };

    receivedBaddie(baddieData, self) {
        this.socket.emit('receivedBaddie', baddieData, () => {
            console.log("got here");
            self.createBaddie(baddieData);
        });
    };

    itemCollected(itemId) {
        this.socket.emit('itemCollected', itemId);
    };

    tryCreateDungeon(mapData) {
        this.socket.emit('instantiateDungeon', mapData, (msg) => {
            console.log(msg);
        });
    };

    deleteDungeon(mapName) {
        this.socket.emit('closeDungeon', mapName, (msg) => {
            console.log(msg);
        });
    };

    reqServers(self) {
        this.socket.emit('reqServers', "", (list) => {
            self.serverList.setText("Servers: " + list);
        });
    };
};