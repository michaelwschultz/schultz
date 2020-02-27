//-----------------------------------------------------------------------------
//  Galv's Character Animations
//-----------------------------------------------------------------------------
//  For: RPGMAKER MV
//  GALV_CharacterAnimations.js
//-----------------------------------------------------------------------------
//  2015-11-16 - Version 1.2 - Fixed a bug with idle not activating in event
//  2015-11-11 - Version 1.1 - added Galv plugin command efficiency code
//  2015-11-03 - Version 1.0 - release
//-----------------------------------------------------------------------------
//  Terms can be found at:
//  galvs-scripts.com
//-----------------------------------------------------------------------------

var Imported = Imported || {};
Imported.Galv_CharacterAnimations = true;

var Galv = Galv || {};        // Galv's main object
Galv.pCmd = Galv.pCmd || {};  // Plugin Command manager
Galv.CA = Galv.CA || {};      // Galv's stuff

//-----------------------------------------------------------------------------
/*:
 * @plugindesc Make the player and follower characters use different
 * graphics for idle, walk and run. View HELP for more info.
 * 
 * @author Galv - galvs-scripts.com
 *
 * @param Common Event ID
 * @desc The common event ID that runs when the idle time expires
 *
 * @default 0
 *
 * @param Common Event Time
 * @desc Amount of frames the player is idle until above common event
 * is activated
 *
 * @default 0
 *
 * @param Repeat Common Event
 * @desc Can be 0 or 1. If 1, the above common event is repeated
 * every time the Common Event Time passes. 0 is no repeat
 *
 * @default 0
 *
 * @help
 *   Galv's Character Animations
 * ----------------------------------------------------------------------------
 * To use this script, you will need a character spritesheet for each of your
 * actors that will be in the party (the full 8 character sheet). While on
 * the map, the characters will change their appearance within their sheets.
 * While not moving (idle) they will use the first character. While walking,
 * they will use the second character. And while running, they will use the
 * third character.
 * While this is happening, the player's step animation is active (meaning
 * while stopped, the idle pose will be stepping). This is so you can make
 * movement in your idle poses.
 *
 * The settings in the plugin allow you to run a common event after the player
 * has been idle for a certain amount of frames. (60 frames per second).
 *
 * The plugin command below can be used to turn functionality on and off.
 * ----------------------------------------------------------------------------
 *    PLUGIN COMMAND
 * ----------------------------------------------------------------------------
 * 
 *    CHARANIM STATUS                   // STATUS can be TRUE or FALSE
 *
 * ----------------------------------------------------------------------------
 * Example:
 * CHARANIM FALSE       // Disables the character animations
 * CHARANIM TRUE        // Enables them again. They are enabled by default
 * ----------------------------------------------------------------------------
 */


//-----------------------------------------------------------------------------
//  CODE STUFFS
//-----------------------------------------------------------------------------



(function() {
	Galv.CA.ceventId = Number(PluginManager.parameters('Galv_CharacterAnimations')["Common Event ID"]);
	Galv.CA.ceventTime = Number(PluginManager.parameters('Galv_CharacterAnimations')["Common Event Time"]);
	Galv.CA.ceventRepeat = Number(PluginManager.parameters('Galv_CharacterAnimations')["Repeat Common Event"]);
	

// GALV'S PLUGIN MANAGEMENT. INCLUDED IN ALL GALV PLUGINS THAT HAVE PLUGIN COMMAND CALLS, BUT ONLY RUN ONCE.
if (!Galv.aliased) {
	var Galv_Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		if (Galv.pCmd[command]) {
			Galv.pCmd[command](args);
			return;
		};
		Galv_Game_Interpreter_pluginCommand.call(this, command, args);
	};
	Galv.aliased = true; // Don't keep aliasing for other Galv scripts.
};

// Direct to Plugin Object
Galv.pCmd.CHARANIM = function(arguments) {
	Galv.CA.animChange(arguments);
};
// END GALV'S PLUGIN MANAGEMENT


Galv.CA.animChange = function(status) {
	if (status[0] === "TRUE") {
		$gamePlayer.disableCharAnims = false;
		$gamePlayer._stepAnime = true;
	} else if (status[0] === "FALSE") {
		$gamePlayer.disableCharAnims = true;
		$gamePlayer._stepAnime = false;
	};
};

Galv.CA.setAnimIndex = function(ind) {
	$gamePlayer._characterIndex = ind;
	$gamePlayer.followers()._data.forEach(function(actor) {
			actor._characterIndex = ind;
		}
	);
};

/// Game Player

var Galv_Game_Player_initMembers = Game_Player.prototype.initMembers;
Game_Player.prototype.initMembers = function() {
	Galv_Game_Player_initMembers.call(this);
	this.idleTime = 0;
};


var Galv_Game_Player_update = Game_Player.prototype.update;
Game_Player.prototype.update = function(sceneActive) {
	Galv_Game_Player_update.call(this,sceneActive);
	if (this.disableCharAnims) return;
	this.updateCharAnims();
};


Game_Player.prototype.updateCharAnims = function() {
	if ($gamePlayer.isMoving()) return this.charAnimMove();
	this.idleTime += 1;
	if (this.idleTime === 5) this.charAnimIdle();
	if (this.idleTime === Galv.CA.ceventTime) this.charAnimCevent();
};


Game_Player.prototype.charAnimMove = function() {
	if ($gamePlayer.isDashing()) {
		Galv.CA.setAnimIndex(2);
	} else {
		Galv.CA.setAnimIndex(1);
	};
	this.idleTime = 0;
};


Game_Player.prototype.charAnimIdle = function() {
	this._stepAnime = true;
	Galv.CA.setAnimIndex(0);
};


Game_Player.prototype.charAnimCevent = function() {
	if ($gameMap._interpreter.isRunning()) return this.idleTime = 0;
	$gameTemp.reserveCommonEvent(Galv.CA.ceventId);
	if (Galv.CA.ceventRepeat === 1) return this.idleTime = 0;
};

})();