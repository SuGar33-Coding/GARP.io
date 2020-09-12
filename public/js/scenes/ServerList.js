/* jshint esversion: 6 */
export default class ServerList extends Phaser.Scene {
    constructor() {
        super({
            key: 'ServerList',
            active: false
        });
    }

    preload() {
        this.load.image('createButton', 'assets/images/createButton.png');
        this.load.image('joinButton', 'assets/images/joinButton.png');
        this.load.image('deleteButton', 'assets/images/deleteButton.png');
        this.load.image('refreshButton', 'assets/images/refreshButton.png');
    }

    create() {
        this.serverList = this.add.text(0, this.cameras.main.centerY - 250, "Servers:", {
            fill: "#ffffff"
        });
        this.serverList.x = this.cameras.main.centerX;

        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY - 125, 'joinButton')
            .setInteractive()
            .on('pointerup', () => this.startGame() );

        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY - 25, 'createButton')
            .setInteractive()
            .on('pointerup', () => this.createDungeon() );

        /* The server crashes if you click this button when someone else is playing so uh. Don't. :) */
        // Hey past Gabe, this might not be the case anymore, just so you know. Might wanna figure that out, future Gabe. :)
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY + 75, 'deleteButton')
            .setInteractive()
            .on('pointerup', () => this.deleteDungeon() );

        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY + 175, 'refreshButton')
            .setInteractive()
            .setScale(.25)
            .on('pointerup', () => this.refreshRooms() );

        // this.refreshRooms();
    }

    /**
     * Start game in the default dungeon
     */
    startGame() {
        let dungeonName = prompt("Dungeon to join", "default");

        this.game.client.joinDungeon(dungeonName);
    }

    /**
     * Instantiate a dungeon on the server
     */
    createDungeon() {
        let dungeonName = prompt("Dungeon to create", "default");

        this.game.client.tryCreateDungeon(dungeonName);

        // TODO: This doesn't do anything cause it takes a sec to create a new Phaser instance
        // RIP
        this.refreshRooms();
    }

    /**
     * Close dungeon on the server
     */
    deleteDungeon() {
        let dungeonName = prompt("Dungeon to delete", "default");
        this.game.client.deleteDungeon(dungeonName);
        this.refreshRooms();
    }

    /**
     * Refresh text-list of instantiated dungeons on server
     */
    refreshRooms() {
        this.game.client.reqServers(this);
    }

    /**
     * Returns an array of objects of type 'type' from specified layer
     * @param {*} type 
     * @param {*} map 
     * @param {*} layer 
     */
    findObjectsByType(type, map, layer) {
        var result = [];
        map.objects[layer].forEach(function (element) {
            if (element.type === type) {
                element.y -= map.tileHeight;
                result.push(element);
            }
        });
        return result;
    }
}