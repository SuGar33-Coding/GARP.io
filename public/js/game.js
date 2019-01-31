var GARP = GARP || {};

GARP.game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, '');

GARP.game.state.add('Boot', GARP.Boot);
//uncomment these as we create them through the tutorial
GARP.game.state.add('Preload', GARP.Preload);
GARP.game.state.add('MainMenu', GARP.MainMenu);
GARP.game.state.add('Dungeon', GARP.Dungeon);


GARP.game.state.start('Boot');

