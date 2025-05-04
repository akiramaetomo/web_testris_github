// scenes/SceneFactory.js
import TitleScene from './TitleScene.js';
import GameplayScene from './GameplayScene.js';
import SettingsScene from './SettingsScene.js';

export function createScene(name, mgr) {
    switch (name) {
        case 'title': return new TitleScene(mgr);
        case 'gameplay': return new GameplayScene(mgr);
        case 'settings': return new SettingsScene(mgr);
        default: throw new Error(`Unknown scene: ${name}`);
    }
}
