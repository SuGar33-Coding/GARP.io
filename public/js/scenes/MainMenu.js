export default class MainMenu extends Phaser.Scene {
    constructor () {
		super({
			key: 'MainMenu',
			active: false
		});
	}

    create() {

        this.title = this.add.sprite(this.game.world.centerX, this.game.world.centerY-200, 'title');
        this.title.anchor.setTo(0.5);
        this.title.scale.setTo(2);

        let playButton = this.game.add.button(this.game.world.centerX, this.game.world.centerY, 'playButton', this.enterServerList, this, 2, 1, 0);
        playButton.anchor.setTo(0.5);

    }

    enterServerList() {
        this.scene.switch('ServerList');
    }
}

