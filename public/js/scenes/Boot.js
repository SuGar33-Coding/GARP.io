/* jshint esversion: 6 */
export default class Boot extends Phaser.Scene {
	constructor () {
		super({
			key: 'Boot',
			active: true
		});
	}

	preload() {
		this.game.stage.smooth = false;
		this.load.image('title', 'assets/images/title.png');
		this.load.image('loadbar', 'assets/images/loadbar.png');
	}

	create() {

		// this.game.stage.backgroundColor = '#000';

		this.scale.scaleMode = Phaser.ScaleManager.RESIZE;
		this.scale.minWidth = 240;
		this.scale.minHeight = 170;
		this.scale.maxWidth = 2880;
		this.scale.maxHeight = 1920;

		//have the game centered horizontally
		this.scale.pageAlignHorizontally = true;

		//screen size will be set automatically
		//this.scale.setScreenSize(true);

		//physics system for movement
		// this.game.physics.startSystem(Phaser.Physics.ARCADE);

		// set the client info
		this.game.client = this.scene.get('Dungeon');

		this.scene.switch('Preload');
	}
}

// Set controls to wasd