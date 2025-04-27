// src/input/inputHandler.js
export const ACTIONS = Object.freeze({
    MOVE_LEFT: 'move_left',
    MOVE_RIGHT: 'move_right',
    ROTATE_L: 'rotate_l',
    ROTATE_R: 'rotate_r',
    SOFT_DROP: 'soft_drop'
});

export class InputHandler {
    constructor() {
        if (new.target === InputHandler) {
            throw new TypeError('InputHandler は直接生成せず、継承してください');
        }
        /** @type {Set<string>} いま押されているアクション */
        this.active = new Set();      // 現在押下中
        this._prev = new Set();      // ひとつ前フレーム
    }
    /** フレーム毎に呼ぶ。派生側で this.active を編集する */
    poll(/* deltaMs */) {
        throw new Error('poll() を実装してください');
    }
    /** true → false へ遷移後にクリアしない */
    isDown(act) { return this.active.has(act); }

    /** 今フレームで Down (立ち上がり) したか */
    isPressed(act) { return this.active.has(act) && !this._prev.has(act); }

    /** poll の最後に呼ぶ（基底で共通） */
    _afterPoll() {
        this._prev = new Set(this.active);   // 深いコピー
    }
}
