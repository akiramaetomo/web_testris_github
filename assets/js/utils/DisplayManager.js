/* utils/DisplayManager.js */
//o3でレンダリングについてCPU負荷を下げるよう最適化,らしい。
import { StatsManager } from './StatsManager.js';

class ViewBase {
    constructor(el) {
        this.el = el;
        this.prevHash = '';
    }
    /**
     * 文字列化した結果が前フレームと同じなら DOM 更新をスキップ
     */
    _diffRender(html) {
        if (html === this.prevHash) return;
        this.prevHash = html;
        this.el.innerHTML = html;
    }
}

/* ------------ Stats ------------ */
class StatsView extends ViewBase {
    update(state) {
        const s     = StatsManager.getStats();
        const speed = state.cfg.dropSpeedLabel;
        const html = /*html*/`
            落下速度: ${speed}<br>
            落下ブロック数: ${s.dropCount}<br>
            トータル消去ライン数: ${s.totalLinesCleared}<br>
            1行消去数: ${s.lineClearCounts[1] ?? 0}<br>
            2行消去数: ${s.lineClearCounts[2] ?? 0}<br>
            3行消去数: ${s.lineClearCounts[3] ?? 0}<br>
            4行消去数: ${s.lineClearCounts[4] ?? 0}
        `;
        this._diffRender(html);
    }
}

/* ------------ Debug ------------ */
class DebugView extends ViewBase {
    update(st) {
        const html = /*html*/`
            landed: ${st.landed ?? "null"}<br>
            landingTimer: ${st.landingTimer?.toFixed(1) ?? "null"}<br>
            spawnTimer: ${st.spawnTimer?.toFixed(1) ?? "null"}<br>
            blockFixed: ${st.blockFixed ?? "null"}<br>
            dropAccumulator: ${st.dropAccumulator?.toFixed(1) ?? "null"}
        `;
        this._diffRender(html);
    }
}

/* ------------ Facade ------------ */
export class DisplayManager {
    constructor(statsEl, debugEl) {
        this.statsView = new StatsView(statsEl);
        this.debugView = new DebugView(debugEl);
        this.frameSkip = 2;            // ← 希望に応じて間引き
        this._counter  = 0;
    }
    /** `state` はゲームループから毎フレーム呼ばれる */
    render(state) {
        // 例：隔フレーム更新で CPU 負荷を半減
        if (this._counter++ % this.frameSkip) return;

        this.statsView.update(state);
        this.debugView.update(state);
    }
}
