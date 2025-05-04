// scenes/SceneManager.js
import { createScene } from './SceneFactory.js';


export class SceneManager {
    /**
     * @param {Scene} initialSceneNameOrInstance  最初に表示するシーン
     */
    constructor(initialScene, appRoot) {
        this._stack = [];
        this.app = appRoot;        // ★ AppRoot を保持
        this.changeTo(initialScene);
    }

    /** 現在のシーンを置き換える */
    changeTo(sceneNameOrInstance, params = {}) {
        if (this._stack.length) {
            this._stack.pop().exit();
        }
        const next =
            typeof sceneNameOrInstance === 'string'
                ? createScene(sceneNameOrInstance, this)
                : sceneNameOrInstance;

        this._pushScene(next, params);
    }

    /** 上に一時的なシーンを重ねる（Pause など Step3 用） */
    push(sceneNameOrInstance, params = {}) {
        const next =
            typeof sceneNameOrInstance === 'string'
                ? createScene(sceneNameOrInstance, this)
                : sceneNameOrInstance;
        this._pushScene(next, params);
    }

    /** push で重ねたシーンを終了させる */
    pop() {
        if (this._stack.length > 1) {
            this._stack.pop().exit();
        }
    }

    /** --- 内部ヘルパ --- */
    _pushScene(scene, params) {
        scene.setManager(this);
        scene.enter(params);
        this._stack.push(scene);
    }

    /** 毎フレーム呼び出す共通 API */
    update(dt) { this._stack.at(-1).update(dt); }
    draw(ctx) { this._stack.at(-1).draw(ctx); }

    /**
     * Returns the current active scene.
     */
    getCurrentScene() { return this._stack.at(-1); }
}
