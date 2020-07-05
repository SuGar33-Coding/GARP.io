export default class MainMenu extends Phaser.Scene {
    constructor() {
        super({
            key: 'MainMenu',
            active: false
        });
    }

    create() {

        this.title = this.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY - 200, 'title').setScale(2);

        let playButton = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'playButton').setInteractive();

        playButton.on('pointerup', () => this.enterServerList(this) );

    }

    enterServerList(context) {
        context.scene.transition({
            target: 'ServerList',
            remove: true,
            duration: 1
        })
    }
}

