import { meta } from '/src/utils/config';
import {
  themeConfig,
  appsPerPageConfig,
  navScaleConfig,
  searchConfig,
  prConfig,
  designConfig,
} from '/src/utils/config';
import { exportSettings, importSettings } from '/src/utils/settingsExport';

export const privacyConfig = ({ options, updateOption, openPanic }) => {
  const isCustom = options.isCustomCloak || (options.tabName && !meta.find(c => c.value.tabName === options.tabName));
  const metaWithCustom = [
    ...meta,
    { option: 'カスタム', value: { id: 'custom', isCustomCloak: true } }
  ];

  const config = {
    1: {
      name: 'サイトタイトル',
      desc: 'このサイトのタブのタイトルとアイコンを変更できます。',
      config: metaWithCustom,
      value: isCustom
        ? metaWithCustom[metaWithCustom.length - 1].value
        : (meta.find(
            (c) => c.value && typeof c.value === 'object' && c.value.tabName === options.tabName,
          ) || meta[0]).value,
      type: 'select',
      action: (a) => {
        if (a.isCustomCloak) {
          updateOption({ isCustomCloak: true });
        } else {
          updateOption({ ...a, isCustomCloak: false });
          import('/src/utils/utils.js').then(({ ckOff }) => ckOff());
        }
      },
    }
  };

  if (isCustom) {
    config[2] = {
      name: 'カスタムタブタイトル',
      desc: 'サイトのタブに表示するタイトルを設定します。',
      value: options.tabName === meta[0].value.tabName ? '' : (options.tabName || ''),
      type: 'input',
      action: (b) => {
        updateOption({ tabName: b || meta[0].value.tabName });
        import('/src/utils/utils.js').then(({ ckOff }) => ckOff());
      },
    };
    config[3] = {
      name: 'カスタムタブアイコン',
      desc: 'サイトのタブに表示するアイコン（URL）を設定します。',
      value: options.tabIcon === meta[0].value.tabIcon ? '' : (options.tabIcon || ''),
      type: 'input',
      action: (b) => {
        updateOption({ tabIcon: b || meta[0].value.tabIcon });
        import('/src/utils/utils.js').then(({ ckOff }) => ckOff());
      },
    };
  }

  config[4] = {
    name: '自動クローク',
    desc: 'タブを切り替えると選択したクロークを自動で適用し、戻ると元の表示に復元します。',
    value: !!options.clkOff,
    type: 'switch',
    action: (b) => {
      setTimeout(() => {
        updateOption({ clkOff: b });
        import('/src/utils/utils.js').then(({ ckOff }) => ckOff());
      }, 100);
    },
    disabled: !options.tabName || options.tabName == meta[0].value.tabName,
  };

  config[5] = {
    name: '起動時に about:blank を開く',
    desc: '有効にすると、アクセス時に about:blank のタブが自動で開きます。',
    value:
      options.aboutBlankAutoOpen === true ||
      (options.aboutBlank && options.aboutBlankAutoOpen !== false),
    type: 'switch',
    action: (b) => setTimeout(() => updateOption({ aboutBlankAutoOpen: b }), 100),
  };

  config[6] = {
    name: 'パニックキー',
    desc: 'パニックキー機能の有効／無効を切り替えます。',
    value: !!options.panicToggleEnabled,
    type: 'switch',
    action: (b) => {
      setTimeout(() => {
        updateOption({ panicToggleEnabled: b });
        import('/src/utils/utils.js').then(({ panic }) => panic());
      }, 100);
    },
  };

  config[7] = {
    name: 'パニックショートカット',
    desc: '押すとページを別のURLへリダイレクトするキーの組み合わせを設定します。',
    value: 'キーを設定',
    type: 'button',
    action: openPanic,
    disabled: !!!options.panicToggleEnabled,
  };

  return config;
};

export const customizeConfig = ({ options, updateOption }) => ({
  1: {
    name: 'サイトのテーマ',
    desc: 'テーマを選択して、サイトの見た目をカスタマイズします。',
    config: themeConfig,
    value: find(themeConfig, (c) => c.value?.themeName === options.themeName, 0),
    type: 'select',
    action: (a) => updateOption(a),
  },
  2: {
    name: '背景デザイン',
    desc: 'サイトの背景デザインをカスタマイズします。',
    config: designConfig,
    value: find(designConfig, (c) => c.value?.bgDesign === options.bgDesign, 0),
    type: 'select',
    action: (a) => updateOption(a),
  },
  3: {
    name: '1ページあたりのアプリ数',
    desc: '1ページに表示するアプリの数です（「すべて」を選ぶとすべて表示されます）。',
    config: appsPerPageConfig,
    value: find(appsPerPageConfig, (c) => c.value.itemsPerPage === (options.itemsPerPage ?? 20), 2),
    type: 'select',
    action: (a) => updateOption(a),
  },
  4: {
    name: 'ナビゲーションの拡大率',
    desc: 'ナビゲーションバーのサイズ（ロゴとフォント）を全体で拡大・縮小します。',
    config: navScaleConfig,
    value: find(navScaleConfig, (c) => c.value.navScale === (options.navScale ?? 1), 3),
    type: 'select',
    action: (a) => updateOption(a),
  },
  5: {
    name: 'タブバー',
    desc: 'タブバーを表示し、複数のサイトを同時に開けるようにします。',
    value: options.showTb ?? true,
    type: 'switch',
    action: (b) => setTimeout(() => updateOption({ showTb: b }), 100),
  },
  6: {
    name: '支援ボタン',
    desc: '「支援する」ボタンを表示するかどうかを切り替えます。',
    value: options.donationBtn ?? true,
    type: 'switch',
    action: (b) => setTimeout(() => updateOption({ donationBtn: b }), 100),
  },
  7: {
    name: 'コンパクトなアプリヘッダー',
    desc: 'アプリ／ゲームのヘッダーを1行にまとめます。',
    value: options.shrinkHeader ?? false,
    type: 'switch',
    action: (b) => setTimeout(() => updateOption({ shrinkHeader: b }), 100),
  },
});

export const browsingConfig = ({ options, updateOption }) => ({
  1: {
    name: '検索エンジン',
    desc: '検索に使うデフォルトの検索エンジンを選択します。',
    config: searchConfig,
    value: find(searchConfig, (c) => c.value?.engine === options.engine, 0),
    type: 'select',
    action: (a) => updateOption(a),
  },
  2: {
    name: 'バックエンドエンジン',
    desc: 'ブラウジングに使うデフォルトのエンジンを選択します。',
    config: prConfig,
    value: find(prConfig, (c) => c.value?.prType === options.prType, 0),
    type: 'select',
    action: (a) => updateOption(a),
  },
});

export const advancedConfig = ({ options, updateOption }) => ({
  1: {
    name: '離脱時に確認',
    desc: 'サイトから離れる際に確認メッセージを表示します。',
    value: !!options.beforeUnload,
    type: 'switch',
    action: (b) => {
      setTimeout(() => updateOption({ beforeUnload: b }));
      location.reload();
    },
  },
  2: {
    name: 'Wisp の設定',
    desc: 'WebSocket サーバーの場所を設定します。',
    value: options.wServer
      ? options.wServer
      : `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}/wisp/`,
    type: 'input',
    action: (b) => updateOption({ wServer: b || null }),
  },
  ...(POPUNDER_ENABLED === 'true'
    ? {
        3: {
          name: '広告を無効化',
          desc: 'キーを入力すると、すべての広告を無効化できます。プレミアム支援者およびベータテスターに配布されています。',
          value: options.adKeyInput || options.adKey || '',
          type: 'input',
          inputValidation: 'adKey',
          action: (b) => updateOption({ adKeyInput: b?.trim() || null }),
        },
      }
    : {}),
  4: {
    name: '設定を書き出す',
    desc: '現在の設定を JSON ファイルとしてダウンロードします。',
    type: 'button',
    value: 'JSONを書き出す',
    action: () => exportSettings(),
  },
  5: {
    name: '設定を読み込む',
    desc: 'JSON ファイルから設定を読み込み、サイトを再読み込みします。',
    type: 'button',
    value: 'JSONを読み込む',
    action: () => importSettings(),
  },
  6: {
    name: 'インスタンスをリセット',
    desc: '問題が起きている場合は、サイトのデータを消去します。',
    type: 'button',
    value: 'データをリセット',
    action: () => import('/src/utils/utils.js').then(({ resetInstance }) => resetInstance()),
  },
});

function find(config, predicate, fallbackIndex = 0) {
  const found = config.find(predicate);
  return found ? found.value : config[fallbackIndex].value; // fallback
}
