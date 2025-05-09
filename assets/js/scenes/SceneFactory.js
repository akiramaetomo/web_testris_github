// scenes/SceneFactory.js
/**
 * @typedef {import('./SceneManager.js').SceneManager} SceneManager
 */

import TitleScene from './TitleScene.js';
import GameplayScene from './GameplayScene.js';
import SettingsScene from './SettingsScene.js';

export class SceneFactory {
    /**
     * シーンを生成するファクトリメソッド
     * @param {string} name - シーン名 ('title', 'gameplay', 'settings')
     * @param {SceneManager} mgr - SceneManager インスタンス
     * @returns {import('../core/Scene.js').Scene}
     */
    createScene(name, mgr) {
        switch (name) {
            case 'title':
                return new TitleScene(mgr);
            case 'gameplay':
                return new GameplayScene(mgr);
            case 'settings':
                return new SettingsScene(mgr);
            default:
                throw new Error(`Unknown scene: ${name}`);
        }
    }
}
