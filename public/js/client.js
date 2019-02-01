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
    }
};

GARP.Client.socket = io.connect();

GARP.Client.socket.on('check', (data) => {
    console.log(data)
});