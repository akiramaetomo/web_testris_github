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
            Enter: ACTIONS.ENTER,          //game start
            ArrowLeft: ACTIONS.ROTATE_L,
            ArrowRight: ACTIONS.ROTATE_R,
            ArrowUp: ACTIONS.MOVE_UP,
            ArrowDown: ACTIONS.MOVE_DOWN,
            ' ': ACTIONS.ENTER,
            Space: ACTIONS.ENTER,
            r: ACTIONS.RESTART,
            R: ACTIONS.RESTART,
            c: ACTIONS.BACK,
            C: ACTIONS.BACK,
            b: ACTIONS.BACK,
            B: ACTIONS.BACK
        };
        window.addEventListener('keydown', e => {
            if (e.repeat) return;                 // ★ repeat を丸ごと無視
//            console.log('[DBG] keydown', e.key);   //for debug
            const act = this.keymap[e.key];
            if (act) this.active.add(act);
        });
        window.addEventListener('keyup', e => {
            const act = this.keymap[e.key];
            if (act) this.active.delete(act);
        });
    }

    poll() {
        // Poll handled in main loop. No internal _afterPoll here.
    }
}
