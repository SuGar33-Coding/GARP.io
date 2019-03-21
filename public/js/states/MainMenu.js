import game from "../game.js"

export default class MainMenu extends Phaser.State {

    create() {

        this.title = this.add.sprite(this.game.world.centerX, this.game.world.centerY-200, 'title');
        this.title.anchor.setTo(0.5);
        this.title.scale.setTo(2);

        let playButton = this.game.add.button(this.game.world.centerX, this.game.world.centerY, 'playButton', this.startGame, this, 2, 1, 0);
        playButton.anchor.setTo(0.5);

        let createDungeonButton = this.game.add.button(this.game.world.centerX, this.game.world.centerY+100, 'playButton', this.createDungeon, this, 2, 1, 0);
        createDungeonButton.anchor.setTo(0.5);

        /* The server crashes if you click this button when someone else is playing so uh. Don't. :) */
        let deleteDungeonButton = this.game.add.button(this.game.world.centerX, this.game.world.centerY+200, 'playButton', this.deleteDungeon, this, 2, 1, 0);
        deleteDungeonButton.anchor.setTo(0.5);

    }

    startGame() {
        this.state.start('Dungeon');
    }

    createDungeon() {
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
            name: 'dungeon1',
            baddieSpawnPoint: this.findObjectsByType('enemy', map, 'objectLayer')[0],
            itemsArray: itemsArray
        }
        
        game.client.tryCreateDungeon(mapData);
    }

    deleteDungeon() {
        game.client.deleteDungeon('dungeon1');
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

