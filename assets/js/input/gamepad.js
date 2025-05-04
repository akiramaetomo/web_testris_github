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
            LEFT: 14,   // D-pad Left
            RIGHT: 15,  // D-pad Right
            UP: 12,     // D-pad Up
            DOWN: 13,   // D-pad Down
            ROT_R: 1,   // Button B
            ROT_L: 2,   // Button X
            SOFT: 13,   // Button A
            START: 9,   // Start button
            BACK: 8     // Back button
        };
    }

    /** 毎フレーム呼び出してボタン状態を更新 */
    poll(/* deltaMs */) {
        this.active.clear();
        // Auto-detect gamepad if not connected via event
        if (this.padIndex === null) {
            const gps = navigator.getGamepads();
            for (let i = 0; i < gps.length; i++) {
                if (gps[i]) { this.padIndex = i; break; }
            }
        }
        if (this.padIndex === null) return;

        const gp = navigator.getGamepads()[this.padIndex];
        if (!gp) return;

        // Analog stick support
//        const threshold = 0.5;
//        if (gp.axes[0] < -threshold) this.active.add(ACTIONS.MOVE_LEFT);
//        if (gp.axes[0] > threshold)  this.active.add(ACTIONS.MOVE_RIGHT);
//        if (gp.axes[1] < -threshold) this.active.add(ACTIONS.MOVE_UP);
//        if (gp.axes[1] > threshold)  this.active.add(ACTIONS.MOVE_DOWN);

        const pressed = idx => gp.buttons[idx]?.pressed;

        if (pressed(this.btn.LEFT))  this.active.add(ACTIONS.MOVE_LEFT);
        if (pressed(this.btn.UP))    this.active.add(ACTIONS.MOVE_UP);
        if (pressed(this.btn.DOWN))  this.active.add(ACTIONS.MOVE_DOWN);
        if (pressed(this.btn.RIGHT)) this.active.add(ACTIONS.MOVE_RIGHT);
        if (pressed(this.btn.ROT_R)) this.active.add(ACTIONS.ROTATE_R);
        if (pressed(this.btn.ROT_L)) this.active.add(ACTIONS.ROTATE_L);
        if (pressed(this.btn.SOFT))  this.active.add(ACTIONS.SOFT_DROP);
        if (pressed(this.btn.START)) this.active.add(ACTIONS.START);
        if (pressed(this.btn.BACK)) this.active.add(ACTIONS.BACK);




    }
}
