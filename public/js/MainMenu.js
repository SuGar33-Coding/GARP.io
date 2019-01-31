GARP.MainMenu = function(){};

GARP.MainMenu.prototype = {

    create: function() {

        this.title = this.add.sprite(this.game.world.centerX, this.game.world.centerY-200, 'title');
        this.title.anchor.setTo(0.5);
        this.title.scale.setTo(2);

        playButton = this.game.add.button(this.game.world.centerX, this.game.world.centerY, 'playButton', actionOnClick, this, 2, 1, 0);
        playButton.anchor.setTo(0.5);

    }
}

function actionOnClick() {
    this.state.start('Dungeon');
}