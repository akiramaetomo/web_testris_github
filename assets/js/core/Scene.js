// core/Scene.js   ESModule
export class Scene {
    /** SceneManager から渡される参照（任意） */

    /**
     * @param {SceneManager} mgr - SceneManager インスタンス
     */
    constructor(mgr) {
        this._mgr = mgr;
    }

//    setManager(manager) { this._mgr = manager; }

    /** 初回呼び出し */        enter(/* params */) { }
    /** 毎フレーム更新 */      update(/* dtMs */) { }
    /** 描画 */                draw(/* ctx */) { }
    /** 終了時 */             exit() { }
}
