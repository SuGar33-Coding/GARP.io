export default class MainMenu extends Phaser.State {

    create() {

        this.title = this.add.sprite(this.game.world.centerX, this.game.world.centerY-200, 'title');
        this.title.anchor.setTo(0.5);
        this.title.scale.setTo(2);

        let playButton = this.game.add.button(this.game.world.centerX, this.game.world.centerY, 'playButton', this.actionOnClick, this, 2, 1, 0);
        playButton.anchor.setTo(0.5);

    }

    actionOnClick() {
        this.state.start('Dungeon');
    }
}

