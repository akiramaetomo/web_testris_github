/**
 * StatsManager: Collects and provides game statistics via EventBus events.
 *
 * Responsibilities:
 *   - init(): Subscribe to game events ('blockSpawned', 'linesCleared').
 *   - dropCount: Number of blocks spawned (one per spawn).
 *   - totalLinesCleared: Total lines cleared across all clears.
 *   - lineClearCounts: Counts of clears by line count (keys 1–4).
 *   - getStats(): Returns a snapshot object of all counters.
 *
 * Usage Example:
 *   import { StatsManager } from './StatsManager.js';
 *   // Initialize subscriptions once before game start
 *   StatsManager.init();
 *   // Later, retrieve stats for display
 *   const stats = StatsManager.getStats();
 *   console.log(stats.dropCount, stats.totalLinesCleared);
 */
import { EventBus } from './EventBus.js';

class StatsManagerClass {
    constructor() {
        this.dropCount = 0;
        this.totalLinesCleared = 0;
        this.lineClearCounts = {1: 0, 2: 0, 3: 0, 4: 0};
        this._inited = false;
    }

    /**
     * Initialize subscriptions to EventBus.
     * Should be called once before game loop starts.
     */
    init() {
        if (this._inited) return;
        EventBus.on('blockSpawned', () => {
            this.dropCount++;
        });
        EventBus.on('linesCleared', (n) => {
            this.totalLinesCleared += n;
            if (this.lineClearCounts[n] != null) {
                this.lineClearCounts[n]++;
            }
        });
        this._inited = true;
    }

    reset() {
        this.dropCount = 0;
        this.totalLinesCleared = 0;
        this.lineClearCounts = {1: 0, 2: 0, 3: 0, 4: 0};
    }

    /**
     * Get a snapshot of current statistics.
     * @returns {{dropCount: number, totalLinesCleared: number, lineClearCounts: object}}
     */
    getStats() {
        return {
            dropCount: this.dropCount,
            totalLinesCleared: this.totalLinesCleared,
            lineClearCounts: { ...this.lineClearCounts }
        };
    }
}

export const StatsManager = new StatsManagerClass();
