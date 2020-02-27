//=============================================================================
// AltMenuScreen.js
//=============================================================================

/*:
 * @plugindesc Skip Title Screen
 * @author Michael Schultz
 *
 * @help This plugin just skips the title screen.
 */

 Scene_Boot.prototype.start = function() {
     Scene_Base.prototype.start.call(this);
     SoundManager.preloadImportantSounds();
     if (DataManager.isBattleTest()) {
         DataManager.setupBattleTest();
         SceneManager.goto(Scene_Battle);
     } else if (DataManager.isEventTest()) {
         DataManager.setupEventTest();
         SceneManager.goto(Scene_Map);
     } else {
         this.checkPlayerLocation();
         DataManager.setupNewGame();
         DataManager.setupNewGame();
         SceneManager.goto(Scene_Map);
     }
     this.updateDocumentTitle();
 };
