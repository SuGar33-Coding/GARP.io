/* jshint esversion: 6 */
export default class ServerList extends Phaser.Scene {
    constructor () {
		super({
			key: 'ServerList',
			active: false
		});
	}

    create() {
        this.serverList = this.add.text(0, this.game.world.centerY-250, "Servers:", {
            fill: "#ffffff"
        });
        this.serverList.anchor.setTo(0.5,0.5);
        this.serverList.x = this.game.world.centerX;

        let joinButton = this.game.add.button(this.game.world.centerX, this.game.world.centerY, 'joinButton', this.startGame, this, 2, 1, 0);
        joinButton.anchor.setTo(0.5);

        let createDungeonButton = this.game.add.button(this.game.world.centerX, this.game.world.centerY+100, 'createButton', this.createDungeon, this, 2, 1, 0);
        createDungeonButton.anchor.setTo(0.5);

        /* The server crashes if you click this button when someone else is playing so uh. Don't. :) */
        let deleteDungeonButton = this.game.add.button(this.game.world.centerX, this.game.world.centerY+200, 'deleteButton', this.deleteDungeon, this, 2, 1, 0);
        deleteDungeonButton.anchor.setTo(0.5);

        let refreshRoomsButton = this.game.add.button(this.game.world.centerX, this.game.world.centerY+300, 'refreshButton', this.refreshRooms, this, 2, 1, 0);
        refreshRoomsButton.anchor.setTo(0.5);
        refreshRoomsButton.scale.setTo(0.25,0.25);

        this.refreshRooms();

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

        let map = this.game.add.tilemap('dungeon');
        map.addTilesetImage('DungeonSet', 'gameTiles');

        let itemsArray = [];

        this.findObjectsByType('item', map, 'objectLayer').forEach(itemData => {
            itemsArray.push({
                xPos: itemData.x,
                yPos: itemData.y,
                properties: itemData.properties
            });
        });

        let mapData = {
            name: dungeonName,
            baddieSpawnPoint: this.findObjectsByType('enemy', map, 'objectLayer')[0],
            itemsArray: itemsArray
        };
        
        this.game.client.tryCreateDungeon(mapData);
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