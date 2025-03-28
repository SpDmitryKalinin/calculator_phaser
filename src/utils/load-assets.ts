import { Scene } from 'phaser';

export type LoadType = 'atlas' | 'image' | 'bitmapFont' | 'audio';

interface AssetData {
    type: LoadType;
    params: string[];
}

const assetsData: Record<string, AssetData> = {
    'background': {
        type: 'image',
        params: ['/assets/bg.jpg'],
    },
    'heart': {
        type: 'image',
        params: ['/assets/heart.png'],
    },
    'hearts': {
        type: 'atlas',
        params: ['/assets/ui/hearts.png', '/assets/ui/hearts.json'],
    },
    'dinamit': {
        type: 'atlas',
        params: ['/assets/dinamit.png', '/assets/dinamit.json'],
    },
    'tempbg': {
        type: 'image',
        params: ['/assets/bggg.png'],
    },
    'progressBg':{
        type: 'image',
        params: ['/assets/progress_bg.png'],
    },
    'progressMask': {
        type: 'image',
        params: ['/assets/progress_mask.png'],
    },
    'progressBar': {
        type: 'image',
        params: ['/assets/progress_bar.png'],
    }
};

const soundData: Record<string, AssetData> = {
    'music_menu': {
        type: 'audio',
        params: ['/assets/sound/F&D_music_menu.mp3'],
    },
};

export type AssetKey = keyof typeof assetsData | keyof typeof soundData;

function checkAssetInCache(scene: Scene, key: AssetKey, type: LoadType): boolean {
    const checkFn: Record<LoadType, () => boolean> = {
        atlas: () => scene.textures.exists(key),
        image: () => scene.textures.exists(key),
        bitmapFont: () => !!scene.cache.bitmapFont.get(key),
        audio: () => !!scene.cache.audio.get(key),
    }

    return checkFn[type]();
}

export default function loadAssets(scene: Scene, usedAssets: AssetKey[]) {
    usedAssets.forEach((key) => {
        const data = (assetsData[key] || soundData[key]) as { type: LoadType, params: string[] } | undefined;
        if (!data) {
            console.warn(`Asset "${key}" not found in asset data`);
            return;
        }

        if (checkAssetInCache(scene, key, data.type)) {
            console.warn(`"${key}" already loaded`);
            return;
        }

        try {
            scene.load[data.type](key, ...data.params);
        } catch (error) {
            console.warn(`Error loading asset "${key}":`, error);
        }
    });
}