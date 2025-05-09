/**
 * scenes/SceneManager.js
 *
 * シーンのライフサイクルとスタック管理を担うクラス。
 * シーンの切り替え（changeTo）、一時重ね合わせ（push）、解除（pop）を提供し、
 * 各シーンの enter/exit/update/draw を適切なタイミングで呼び出します。
 *
 * 設計思想：
 * - シーン生成ロジックを外部から注入（Dependency Injection）することで、
 *   モックファクトリを利用した単体テストや将来の拡張を容易に。
 * - AppRoot（アプリケーションのエントリーポイント）インスタンスを保持し、
 *   各シーンから BGM／設定／イベントバスなどアプリ全体のリソースへアクセス可能。
 * - 実行時の依存関係を最小限にし、責務を「シーン管理」に限定。
 *
 * @template {import('../core/Scene.js').Scene} SceneType
 * @param {function(string, SceneManager): SceneType} sceneFactory
 *    シーンを生成するファクトリ関数（createScene など）。
 * @param {string | SceneType} initial
 *    初期表示シーンの名前またはインスタンス。
 * @param {import('../AppRoot.js').AppRoot} appRoot
 *    アプリケーション全体のリソース／設定を保持する AppRoot インスタンス。
 */

export class SceneManager {
    /**
     * @param {Function} sceneFactory  シーンを生成するファクトリ関数(createScene)
     * @param {string|object} initial  最初に表示するシーン名またはインスタンス
     * @param {AppRoot} appRoot        AppRoot のインスタンス
     */
    constructor(sceneFactory, initial, appRoot) {
        this._stack = [];
        this.app = appRoot;
        this.createScene = sceneFactory;
        this.changeTo(initial);
    }

    /** 現在のシーンを置き換える */
    changeTo(sceneNameOrInstance, params = {}) {
        if (this._stack.length) {
            this._stack.pop().exit();
        }
        const next =
            typeof sceneNameOrInstance === 'string'
                ? this.createScene(sceneNameOrInstance, this)
                : sceneNameOrInstance;

        this._pushScene(next, params);

    //    this.gameConfig = new GameConfig(window.settingOptions);//これでうまくいくか！？->NG


    }

    /** 上に一時的なシーンを重ねる（Pause など Step3 用） */
    push(sceneNameOrInstance, params = {}) {
        const next =
            typeof sceneNameOrInstance === 'string'
                ? this.createScene(sceneNameOrInstance, this)
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
    //    scene.setManager(this);
        scene.enter(params);
        this._stack.push(scene);
    }

    /** 毎フレーム呼び出す共通 API */
    update(dt) { this._stack[this._stack.length - 1].update(dt); }
    draw(ctx) { this._stack[this._stack.length - 1].draw(ctx); }

    /**
     * Returns the current active scene.
     */
    getCurrentScene() { return this._stack[this._stack.length - 1]; }
}
