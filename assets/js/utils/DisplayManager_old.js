// assets/js/utils/DisplayManager.js
import { StatsManager } from './StatsManager.js';

class StatsView {
    constructor(el) {
        this.el = el;
    }

    update(state) {
        const stats = StatsManager.getStats();
        const dropSpeed = state.cfg.dropSpeedLabel;
        const html =
            "落下速度: " + dropSpeed + "<br>" +
            "落下ブロック数: " + stats.dropCount + "<br>" +
            "トータル消去ライン数: " + stats.totalLinesCleared + "<br>" +
            "1行消去数: " + stats.lineClearCounts[1] + "<br>" +
            "2行消去数: " + stats.lineClearCounts[2] + "<br>" +
            "3行消去数: " + stats.lineClearCounts[3] + "<br>" +
            "4行消去数: " + stats.lineClearCounts[4];
        this.el.innerHTML = html;
    }
}

class DebugView {
    constructor(el) {
        this.el = el;
    }

    update(state) {
        const html = [
            "landed: " + (state.landed ?? "null"),
            "landingTimer: " + (state.landingTimer != null ? state.landingTimer.toFixed(1) : "null"),
            "spawnTimer: " + (state.spawnTimer != null ? state.spawnTimer.toFixed(1) : "null"),
            "blockFixed: " + (state.blockFixed ?? "null"),
            "dropAccumulator: " + (state.dropAccumulator != null ? state.dropAccumulator.toFixed(1) : "null")
        ].join("<br>");
        this.el.innerHTML = html;
    }
}

export class DisplayManager {
    constructor(statsEl, infoEl) {
        this.statsView = new StatsView(statsEl);
        this.debugView = new DebugView(infoEl);
    }

    render(state) {
        this.statsView.update(state);
        this.debugView.update(state);
    }
}
