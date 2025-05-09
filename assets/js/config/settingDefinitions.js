export const SETTING_DEFINITIONS = [
    {
        key: 'speedIndex',
        label: '落下速度',
        options: [
            { label: '20G(833us)', value: 0.833 },
            { label: '10G(1.67ms)', value: 1.667 },
            { label: '5G(3.33ms)', value: 3.333 },
            { label: '1G(16.67ms)', value: 16.667 },
            { label: '0.5G(33.3ms)', value: 33.3 },
            { label: '50ms', value: 50 },
            { label: '100ms', value: 100 },
            { label: '500ms', value: 500 },
            { label: '1s', value: 1000 }
        ],
        defaultIndex: 3
    },
    {
        key: 'fieldSize',
        label: 'フィールド',
        options: [
            { label: '10×20', value: [10, 20] },
            { label: '15×30', value: [15, 30] },
            { label: '20×40', value: [20, 40] }
        ],
        defaultIndex: 0
    },
    {
        key: 'bgm',
        label: 'BGM',
        options: [
            { label: 'default', value: 'bgm_play' },
            { label: 'TB303-1', value: 'bgm_play2' },
            { label: 'TB303-2', value: 'bgm_play3' },
            { label: 'TB303-3', value: 'bgm_play4' }
        ],
        defaultIndex: 0
    }
];


// wavファイル設定
export const SOUND_PATHS = {
    move: './assets/audio/move.wav',
    rotate: './assets/audio/rotate.wav',
    land: './assets/audio/land.wav',
    fix: './assets/audio/fix.wav',
    clear: './assets/audio/clear.wav',
    drop: './assets/audio/drop.wav',
    bgm_play: './assets/audio/bgm_play.wav',
    bgm_over: './assets/audio/bgm_over.wav',
    se_over: './assets/audio/se_over.wav'
};

export const BGM_PATHS = {
    bgm_init: './assets/audio/bgm_init.wav',
    bgm_play: './assets/audio/bgm_play.wav',
    bgm_over: './assets/audio/bgm_over.wav',
    bgm_play2: './assets/audio/bgm_play2.wav',
    bgm_play3: './assets/audio/bgm_play3.wav',
    bgm_play4: './assets/audio/bgm_play4.wav'
};
