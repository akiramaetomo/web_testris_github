// utils/perfStats.js  ── ES Module
//負荷率を計測するためのclassメインのloop内、でbegin、endをcall。
//F3キーで非表示
export class PerfStats {
    /**
     * @param {object} opt
     *   { enabled = true, interval = 1000, keyToggle = 'F3' }
     */
    constructor(opt = {}) {
        const {
            enabled = true,
            interval = 1000,
            keyToggle = 'F3'
        } = opt;

        // 内部状態
        this.enabled = enabled;
        this.interval = interval;
        this.keyToggle = keyToggle;

        this._frameCnt = 0;
        this._workSum = 0;
        this._lastTick = performance.now();

        // DOM 要素生成
        this._elm = document.createElement('div');
        Object.assign(this._elm.style, {
            position: 'absolute',
            right: '8px',
            top: '8px',
            color: '#0f0',
            font: '18px monospace',
            background: 'rgba(0,0,0,.35)',
            padding: '2px 4px',
            pointerEvents: 'none',
            display: this.enabled ? 'block' : 'none'
        });
        this._elm.textContent = 'PerfStats…';
        document.body.appendChild(this._elm);

        // キートグル
        window.addEventListener('keydown', e => {
            if (e.key === this.keyToggle) this.toggle();
        });
    }

    /** 1 フレーム冒頭で呼ぶ */
    begin() {
        this._start = performance.now();
    }

    /** 1 フレーム末尾で呼ぶ */
    end() {
        if (!this.enabled) return;

        const work = performance.now() - this._start;
        this._frameCnt++;
        this._workSum += work;

        const now = this._start;
        if (now - this._lastTick >= this.interval) {
            const elapsed = now - this._lastTick;
            const fps = (this._frameCnt * 1000 / elapsed).toFixed(1);
            const busy = (this._workSum * 100 / elapsed).toFixed(1);

            this._elm.textContent = `FPS : ${fps}\nbusy: ${busy}%`;

            // リセット
            this._frameCnt = 0;
            this._workSum = 0;
            this._lastTick = now;
        }
    }

    toggle(on = !this.enabled) {
        this.enabled = on;
        this._elm.style.display = on ? 'block' : 'none';
    }
}
