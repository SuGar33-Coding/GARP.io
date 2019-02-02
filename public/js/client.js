var GARP = GARP || {};

GARP.Client = {
    sendPlayer: function(x, y) {
        playerData = {
            xPos: x,
            yPos: y
        }
        this.socket.emit('addPlayerToServer', playerData);
    },

    testFunc: function() {
        this.socket.emit('test', "Test Went Thru");
    },

    enteredDungeon: function() {
        GARP.Client.socket.emit('enterDungeon');
    },

    playerMoved: function(playerData) {
        GARP.Client.socket.emit('playerMoved', playerData);
    }
};

GARP.Client.socket = io.connect();

GARP.Client.socket.on('check', (data) => {
    console.log(data)
});

GARP.Client.socket.on('updatePlayers', (playerList) => {
    //GARP.Dungeon.prototype.updateOtherPlayers(playerList);
    //this.updateOtherPlayers(playerList);
    GARP.Dungeon.updateOtherPlayers(playerList);
});