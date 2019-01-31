var GARP = GARP || {};

GARP.Boot = function(){};

GARP.Boot.prototype = {

  preload: function() {
    this.load.image('title', 'assets/images/title.png');
    this.load.image('loadbar', 'assets/images/loadbar.png');
  },

  create: function() {
    this.game.stage.backgroundColor = '#000';

	this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
	this.scale.minWidth = 240;
	this.scale.minHeight = 170;
	this.scale.maxWidth = 2880;
	this.scale.maxHeight = 1920;
	
	//have the game centered horizontally
	this.scale.pageAlignHorizontally = true;

	//screen size will be set automatically
	//this.scale.setScreenSize(true);

	//physics system for movement
	this.game.physics.startSystem(Phaser.Physics.ARCADE);
    
    this.state.start('Preload');
  }
};

// Set controls to wasd