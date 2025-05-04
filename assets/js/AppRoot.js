/* ====================================================================
 *  AppRoot.js  ―  “アプリ唯一の組み立てクラス”
 * ==================================================================*/
import { GameConfig } from './core/GameConfig.js';
import { Engine } from './core/Engine.js';
import { SceneManager } from './scenes/SceneManager.js';
import { createScene } from './scenes/SceneFactory.js';

import { CombinedInputHandler } from './input/CombinedInputHandler.js';
import { ACTIONS } from './input/inputHandler.js';

import { soundManager } from './audio/globalSoundManager.js'; // 既存シングルトン
import { BGMManager } from './audio/BGMManager.js';

import { StatsManager } from './utils/StatsManager.js';
import { DisplayManager } from './utils/DisplayManager.js';
import { WallpaperController } from './utils/WallpaperController.js';
import { PerfStats } from './utils/perfStats.js';
import { AppInitializer } from './utils/AppInitializer.js';
import { EventBus } from './utils/EventBus.js';

export class AppRoot {
    constructor() {
        /* ---------------- 1. 生成フェーズ ---------------- */
        /* ★ ここで先に bgm を作り window に出しておく */
        this.bgm = new BGMManager();
        window.bgmManager = this.bgm;


        this.eventBus = EventBus;                      // 既存シングルトンを転用

        /* 入力 */
        this.input = new CombinedInputHandler();
        window.input = this.input;                     // 既存コード互換のため暫定公開

        /* 設定 & エンジン */
        const cfgObj = { speedIndex: window.settingOptions?.['落下速度'] };
        this.gameConfig = new GameConfig(cfgObj);
        this.engine = new Engine('gameCanvas', this.gameConfig);

        /* シーンマネージャ */
        this.scenes = new SceneManager(createScene('title', null), this);

        /* サウンド */
        this.sound = soundManager;               // globalSoundManager.js で export 済
        //    this.bgm        = new BGMManager();           // ★ 引数なしコンストラクタ
        //    window.bgmManager = this.bgm;        // ★ ここで即公開（SceneManager 作成より前）

        /* 統計・表示・壁紙 */
        this.statsMgr = StatsManager;
        this.perfStats = new PerfStats({ enabled: true, interval: 1000, keyToggle: 'F3' });

        const nextW = document.getElementById('nextCanvas').width;
        const statsEl = document.getElementById('statsArea');
        const infoEl = document.getElementById('infoArea');

        statsEl.style.width = `${nextW}px`;
        infoEl.style.width = `${nextW}px`;
        statsEl.style.height = `${this.engine.canvas.height}px`;

        this.displayMgr = new DisplayManager(statsEl, infoEl);
        this.wallpaper = new WallpaperController();

        /* AppInitializer で非同期タスクをまとめる */
        this.initTasks = new AppInitializer();

        this._registerInitTasks(statsEl, infoEl);
    }

    /** 非同期初期化タスクの登録 */
    _registerInitTasks(statsEl, infoEl) {
        /* 1) サウンドロード */
        this.initTasks.register('LoadSounds', async () => {
            await this.sound.loadAllSounds({
                move: './assets/audio/move.wav',
                rotate: './assets/audio/rotate.wav',
                land: './assets/audio/land.wav',
                fix: './assets/audio/fix.wav',
                clear: './assets/audio/clear.wav',
                drop: './assets/audio/drop.wav',
                bgm_play: './assets/audio/bgm_play.wav',
                bgm_over: './assets/audio/bgm_over.wav',
                se_over: './assets/audio/se_over.wav'
            });
            this.sound.setVolume({ master: 0.1, sfx: 0.2, bgm: 0.2 });
        });

        /* 2) StatsManager 初期化 */
        this.initTasks.register('InitStatsManager', async () => {
            this.statsMgr.init();
        });

        /* 3) DisplayManager 初期化 */
        this.initTasks.register('InitDisplayManager', async () => {
            this.displayMgr.init?.();                    // init() がある場合だけ
        });

        /* 4) Wallpaper 初期化 */
        this.initTasks.register('InitWallpaper', async () => {
            await this.wallpaper.init();
        });

        /* 5) BGMManager 初期化 */
        this.initTasks.register('InitBGMManager', async () => {
            await this.bgm.init({
                bgm_init: './assets/audio/bgm_init.wav',
                bgm_play: './assets/audio/bgm_play.wav',
                bgm_over: './assets/audio/bgm_over.wav'
            });
            this.bgm.play('bgm_init', { loop: true });
        });
    }

    /** アプリ起動（初期化完了後にメインループ開始） */
    async start() {
        await this.initTasks.init();                  // 既存の runAll 相当

        let lastStatsHTML = "";
        this.engine.start((dt) => {
            this.perfStats.begin();
            this.input.poll(dt);

            this.scenes.update(dt);
            this.scenes.draw(this.engine.ctx);

            /* 情報／デバッグ表示 */
            const scene = this.scenes.getCurrentScene();
            if (scene.state?.cfg) {
                this.displayMgr.render(scene.state);
                lastStatsHTML = document.getElementById('statsArea').innerHTML;
            } else {
                document.getElementById('statsArea').innerHTML = lastStatsHTML;
                document.getElementById('infoArea').innerHTML = "";
            }

            this.input._afterPoll();                    // 既存ロジック保持
            this.perfStats.end();
        });

        /* 起動完了イベント */
        this.eventBus.emit('phaseChanged', 'title');
    }
}

/* シングルトンとして公開（旧 window.bgmManager などの互換維持用） */
export const app = new AppRoot();
window.app = app;
//window.bgmManager = app.bgm;        // 旧参照が残っていても動くように
window.engine = app.engine;     // 必要に応じて追加
