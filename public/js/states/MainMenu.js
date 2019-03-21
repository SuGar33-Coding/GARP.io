import game from "../game.js"

export default class MainMenu extends Phaser.State {

    create() {

        this.title = this.add.sprite(this.game.world.centerX, this.game.world.centerY-200, 'title');
        this.title.anchor.setTo(0.5);
        this.title.scale.setTo(2);

        this.serverList = this.add.text(0, 0, "Servers:", {
            fill: "#ffffff"
        });

        let playButton = this.game.add.button(this.game.world.centerX, this.game.world.centerY, 'playButton', this.startGame, this, 2, 1, 0);
        playButton.anchor.setTo(0.5);

        let createDungeonButton = this.game.add.button(this.game.world.centerX, this.game.world.centerY+100, 'playButton', this.createDungeon, this, 2, 1, 0);
        createDungeonButton.anchor.setTo(0.5);

        /* The server crashes if you click this button when someone else is playing so uh. Don't. :) */
        let deleteDungeonButton = this.game.add.button(this.game.world.centerX, this.game.world.centerY+200, 'playButton', this.deleteDungeon, this, 2, 1, 0);
        deleteDungeonButton.anchor.setTo(0.5);

        let refreshRoomsButton = this.game.add.button(this.game.world.centerX, this.game.world.centerY+300, 'playButton', this.refreshRooms, this, 2, 1, 0);
        refreshRoomsButton.anchor.setTo(0.5);

    }

    /**
     * Start game in the default dungeon
     */
    startGame() {
        this.state.start('Dungeon');
    }

    /**
     * Instantiate a dungeon on the server
     */
    createDungeon() {
        let dungeonName = prompt("Dungeon name", "MySuperCoolFungeon");

        let map = this.game.add.tilemap('dungeon');
        map.addTilesetImage('DungeonSet', 'gameTiles');

        let itemsArray = []

        this.findObjectsByType('item', map, 'objectLayer').forEach(itemData => {
            itemsArray.push({
                xPos: itemData.x,
                yPos: itemData.y,
                properties: itemData.properties
            })
        });

        let mapData = {
            name: dungeonName,
            baddieSpawnPoint: this.findObjectsByType('enemy', map, 'objectLayer')[0],
            itemsArray: itemsArray
        }
        
        game.client.tryCreateDungeon(mapData);
    }

    /**
     * Close dungeon on the server
     */
    deleteDungeon() {
        let dungeonName = prompt("Dungeon to delete", "MySuperLameDumbgeon");
        game.client.deleteDungeon(dungeonName);
    }

    /**
     * Refresh text-list of instantiated dungeons on server
     */
    refreshRooms() {
        game.client.reqServers(this);
    }

    /**
     * Returns an array of objects of type 'type' from specified layer
     * @param {*} type 
     * @param {*} map 
     * @param {*} layer 
     */
    findObjectsByType(type, map, layer) {
        var result = new Array();
        map.objects[layer].forEach(function (element) {
            if (element.type === type) {
                element.y -= map.tileHeight;
                result.push(element);
            }
        });
        return result;
    }
}

