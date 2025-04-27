///keyboard.js
//リピート無視
import { ACTIONS, InputHandler } from './inputHandler.js';

export class KeyboardInputHandler extends InputHandler {
    constructor() {
        super();
        this.keymap = {
            a: ACTIONS.MOVE_LEFT,
            s: ACTIONS.MOVE_RIGHT,
            z: ACTIONS.SOFT_DROP,
            ArrowLeft: ACTIONS.ROTATE_L,
            ArrowRight: ACTIONS.ROTATE_R
        };
        window.addEventListener('keydown', e => {
            if (e.repeat) return;                 // ★ repeat を丸ごと無視
            const act = this.keymap[e.key];
            if (act) this.active.add(act);
        });
        window.addEventListener('keyup', e => {
            const act = this.keymap[e.key];
            if (act) this.active.delete(act);
        });
    }

    poll() { /* キーボードはイベント駆動なので何もせず */ 
        //this._afterPoll(); 
    }
}