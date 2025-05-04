// soundManager.js  2025-04-26 rev.1
export class SoundManager {
    constructor() {
        /* ---------- 基本 ---------- */
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.buffers = {};      // { name : AudioBuffer }
        this.sources = {};      // { name : [AudioBufferSourceNode …] }

        /* ---------- バス構成 ---------- */
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.connect(this.audioCtx.destination);

        this.sfxBus = this.audioCtx.createGain();  // 効果音用
        this.bgmBus = this.audioCtx.createGain();  // BGM 用
        this.sfxBus.connect(this.masterGain);
        this.bgmBus.connect(this.masterGain);

        /* ---------- BGM フェード管理 ---------- */
        this.bgmSource = null;
        this.bgmGain = null;     // BGM トラック個別の Gain
    }

    /* =================================================
     *  1. ロード周り
     * ================================================= */
    async loadSound(name, url) {
        if (this.buffers[name]) return;  // 二重ロード防止
        try {
            const res = await fetch(url);
            const abuf = await res.arrayBuffer();
            this.buffers[name] = await this.audioCtx.decodeAudioData(abuf);
        } catch (e) {
            console.error(`Sound load failed: ${name} (${url})`, e);
        }
    }

    async loadAllSounds(dict) {
        await Promise.all(
            Object.entries(dict).map(([k, v]) => this.loadSound(k, v))
        );
    }

    /* =================================================
     *  2. 再生
     * ================================================= */
    /**
     * @param {string} name  ロード済みバッファ名
     * @param {object|boolean} opts
     *  {loop, volume, playbackRate, detune, pan, bus, effects}
     */
    play(name, loop = false) {

        /* ------------------ 新旧 API 統合 ------------------ */
        let opts = {};
        if (typeof loop === 'object') {      // { … } が渡された場合
            opts = loop;
            loop = !!opts.loop;              // 真偽値に正規化
        }

        /* ここでオプション展開（★ effects を忘れずに） */
        const {
            volume = (loop ? 1 : 0.9),
            playbackRate = 1,
            detune = 0,
            poly = false,
            pan = 0,
            bus = 'sfx',            // 'sfx' | 'bgm'
            effects = []                // AudioNode[] : 追加エフェクト
        } = opts;

        const buf = this.buffers[name];
        if (!buf) {
            console.warn(`buffer "${name}" not loaded`);
            return;
        }

        /* ---------- sfx ポリフォニック抑制 ---------- */
        if (!loop && bus === 'sfx' && this.sources[name]?.length) {
            // すでに鳴っている全ノードを停止
            this.sources[name].forEach(src => src.stop());
            // 配列は onended ハンドラで自動クリアされる
        }

        //ポリ再生したい場合
        // play('laser', {poly:true}) と呼んだときだけ多重再生
//        if (!loop && bus === 'sfx' && !opts.poly && this.sources[name]?.length) {
//            this.sources[name].forEach(src => src.stop());
//        }


        /* ---------- BGM １音ポリ ---------- */
        if (loop && bus === 'bgm' && this.bgmSource) {
            this.bgmSource.stop();
            this.bgmSource = null;
            this.bgmGain = null;
        }

        /* ---------- ノード生成 ---------- */
        const src = this.audioCtx.createBufferSource();
        src.buffer = buf;
        src.loop = loop;
        src.playbackRate.value = playbackRate;
        src.detune.value = detune;

        /* ---------- ゲイン & パン ---------- */
        const gainNode = this.audioCtx.createGain();
        gainNode.gain.value = volume;

        const panNode = this.audioCtx.createStereoPanner();
        panNode.pan.value = pan;

        /* ---------- ルーティング ----------
           source → (effects …) → gain → pan → bus → master → destination
           ---------------------------------- */
        let last = src;

        /* user-supplied effects */
        for (const node of effects) {
            if (node instanceof AudioNode) {
                last.connect(node);
                last = node;
            }
        }

        last.connect(gainNode);
        gainNode.connect(panNode);
        panNode.connect(bus === 'bgm' ? this.bgmBus : this.sfxBus);

        /* ---------- BGM 用ノード保持 ---------- */
        if (loop && bus === 'bgm') {
            this.bgmSource = src;
            this.bgmGain = gainNode;   // ← 変数名ミスを修正
        }

        /* ---------- 後始末用 book-keeping ---------- */
        (this.sources[name] ||= []).push(src);
        src.onended = () => {
            if (this.sources[name]) {
                this.sources[name] = this.sources[name].filter(s => s !== src);
            }
            if (src === this.bgmSource) {
                this.bgmSource = null;
                this.bgmGain = null;
            }
        };

        src.start();
        return src;                      // 返り値を使いたい場合用
    }




    /** 個別停止 */
    stop(name) {
        (this.sources[name] || []).forEach(s => s.stop());
        delete this.sources[name];
    }

    /** 全停止（デバッグ用） */
    stopAll() {
        Object.keys(this.sources).forEach(n => this.stop(n));
    }

    /* =================================================
     *  3. 音量ユーティリティ
     * ================================================= */
    /** 0–1 で指定（省略したキーは変更しない） */
    setVolume({ master, bgm, sfx } = {}) {
        if (master != null) this.masterGain.gain.value = master;
        if (bgm != null) this.bgmBus.gain.value = bgm;
        if (sfx != null) this.sfxBus.gain.value = sfx;
    }

    /* =================================================
     *  4. BGM 制御
     * ================================================= */
    fadeOutBgm(ms = 1000) {
        if (!this.bgmSource || !this.bgmGain) return;
        const now = this.audioCtx.currentTime;
        this.bgmGain.gain.cancelScheduledValues(now);
        this.bgmGain.gain.setValueAtTime(this.bgmGain.gain.value, now);
        this.bgmGain.gain.linearRampToValueAtTime(0, now + ms / 1000);
        this.bgmSource.stop(now + ms / 1000 + 0.05);
        this.bgmSource = null;
        this.bgmGain = null;
    }

    /* =================================================
     *  5. iOS/Chrome ブロック回避
     * ================================================= */
    resumeContext() {
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
    }
}
