//gamepad.js
//エッジ検知付き

import { ACTIONS, InputHandler } from './inputHandler.js';

export class GamepadInputHandler extends InputHandler {
    constructor() {
        super();
        this.padIndex = null;
        window.addEventListener('gamepadconnected',  e => this.padIndex = e.gamepad.index);
        window.addEventListener('gamepaddisconnected', e => {
            if (this.padIndex === e.gamepad.index) this.padIndex = null;
        });
        // デフォルトマッピング ― コントローラに合わせて調整可

        this.btn = {
            LEFT: 14,  // D‑pad Left
            RIGHT:15,  // D‑pad Right
            ROT_R: 1,  //
            ROT_L: 2,
            SOFT: 13    // RT / R2
        };
    }

    /** 毎フレーム呼び出してボタン状態を更新 */
    poll(/* deltaMs */) {
        this.active.clear();
        if (this.padIndex === null) return;

        const gp = navigator.getGamepads()[this.padIndex];
        
        if(!gp) return; 

        const pressed = idx => gp.buttons[idx]?.pressed;

        if (pressed(this.btn.LEFT))  this.active.add(ACTIONS.MOVE_LEFT);
        if (pressed(this.btn.RIGHT)) this.active.add(ACTIONS.MOVE_RIGHT);
        if (pressed(this.btn.ROT_R)) this.active.add(ACTIONS.ROTATE_R);
        if (pressed(this.btn.ROT_L)) this.active.add(ACTIONS.ROTATE_L);
        if (pressed(this.btn.SOFT))  this.active.add(ACTIONS.SOFT_DROP);



    }
}
