// Service Worker for メルカリ価格自動調整ツール

// 拡張機能インストール時の初期化
chrome.runtime.onInstalled.addListener(async () => {
  console.log('メルカリ価格調整ツールがインストールされました');
  
  // デフォルト設定を保存
  const defaultSettings = {
    isEnabled: false,
    minPrice: 300,
    startTime: '09:00',
    endTime: '21:00',
    selectedProducts: [],
    executionLogs: []
  };
  
  await chrome.storage.local.set(defaultSettings);
  
  // 毎日のアラームを設定
  setupDailyAlarm();
});

// 毎日のアラーム設定
async function setupDailyAlarm() {
  // 既存のアラームをクリア
  await chrome.alarms.clear('dailyPriceCheck');
  
  // 毎日午前8時にアラームを設定（実際の実行時間はランダムに決定）
  chrome.alarms.create('dailyPriceCheck', {
    when: getNextAlarmTime(),
    periodInMinutes: 24 * 60 // 24時間ごと
  });
}

// 次のアラーム時間を計算
function getNextAlarmTime() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(8, 0, 0, 0);
  return tomorrow.getTime();
}

// アラーム処理
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'dailyPriceCheck') {
    console.log('日次価格調整チェックを開始');
    await handleDailyPriceAdjustment();
  }
});

// 日次価格調整処理
async function handleDailyPriceAdjustment() {
  try {
    const settings = await chrome.storage.local.get([
      'isEnabled', 'startTime', 'endTime', 'selectedProducts', 'minPrice'
    ]);
    
    if (!settings.isEnabled) {
      console.log('自動値下げが無効になっています');
      return;
    }
    
    if (!settings.selectedProducts || settings.selectedProducts.length === 0) {
      console.log('対象商品が選択されていません');
      return;
    }
    
    // ランダムな実行時間を計算
    const executionTime = calculateRandomExecutionTime(settings.startTime, settings.endTime);
    const now = new Date();
    const delay = executionTime.getTime() - now.getTime();
    
    if (delay > 0) {
      console.log(`価格調整を${executionTime.toLocaleTimeString()}に実行予定`);
      setTimeout(() => {
        executePriceAdjustment(settings);
      }, delay);
    } else {
      // 既に実行時間を過ぎている場合は即座に実行
      await executePriceAdjustment(settings);
    }
  } catch (error) {
    console.error('日次価格調整処理でエラーが発生:', error);
  }
}

// ランダムな実行時間を計算
function calculateRandomExecutionTime(startTime, endTime) {
  const today = new Date();
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  const startMs = startHour * 60 * 60 * 1000 + startMinute * 60 * 1000;
  const endMs = endHour * 60 * 60 * 1000 + endMinute * 60 * 1000;
  
  const randomMs = startMs + Math.random() * (endMs - startMs);
  
  const executionTime = new Date(today);
  executionTime.setHours(0, 0, 0, 0);
  executionTime.setTime(executionTime.getTime() + randomMs);
  
  return executionTime;
}

// 価格調整実行
async function executePriceAdjustment(settings) {
  try {
    console.log('価格調整を実行中...');
    
    // メルカリのマイページを開く
    const tabs = await chrome.tabs.query({url: 'https://jp.mercari.com/*'});
    let targetTab;
    
    if (tabs.length > 0) {
      targetTab = tabs[0];
    } else {
      // 新しいタブでメルカリを開く
      targetTab = await chrome.tabs.create({
        url: 'https://jp.mercari.com/mypage/listings/listing',
        active: false
      });
      
      // ページの読み込みを待つ
      await new Promise(resolve => {
        const listener = (tabId, changeInfo) => {
          if (tabId === targetTab.id && changeInfo.status === 'complete') {
            chrome.tabs.onUpdated.removeListener(listener);
            resolve();
          }
        };
        chrome.tabs.onUpdated.addListener(listener);
      });
    }
    
    // コンテンツスクリプトに価格調整を指示
    await chrome.tabs.sendMessage(targetTab.id, {
      action: 'adjustPrices',
      selectedProducts: settings.selectedProducts,
      minPrice: settings.minPrice
    });
    
  } catch (error) {
    console.error('価格調整実行でエラーが発生:', error);
    
    // エラーログを保存
    const errorLog = {
      timestamp: new Date().toISOString(),
      type: 'error',
      message: `価格調整実行エラー: ${error.message}`
    };
    
    const result = await chrome.storage.local.get(['executionLogs']);
    const logs = result.executionLogs || [];
    logs.unshift(errorLog);
    
    // ログは最新100件まで保持
    if (logs.length > 100) {
      logs.splice(100);
    }
    
    await chrome.storage.local.set({ executionLogs: logs });
  }
}

// ポップアップからのメッセージ処理
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSettings') {
    chrome.storage.local.get([
      'isEnabled', 'minPrice', 'startTime', 'endTime', 
      'selectedProducts', 'executionLogs', 'products'
    ]).then(sendResponse);
    return true;
  }
  
  if (request.action === 'saveSettings') {
    chrome.storage.local.set(request.settings).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (request.action === 'clearLogs') {
    chrome.storage.local.set({ executionLogs: [] }).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (request.action === 'updateProducts') {
    chrome.storage.local.set({ products: request.products }).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (request.action === 'logPriceAdjustments') {
    handlePriceAdjustmentResults(request.results).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (request.action === 'settingsUpdated') {
    // オプション画面からの設定更新通知
    console.log('設定が更新されました:', request.settings);
    sendResponse({ success: true });
    return true;
  }
});

// 価格調整結果のログ処理
async function handlePriceAdjustmentResults(results) {
  for (const result of results) {
    if (result.success) {
      await addLog(
        'success',
        '価格を更新しました',
        result.productName || `商品ID: ${result.productId}`,
        result.oldPrice,
        result.newPrice
      );
    } else {
      await addLog(
        'error',
        result.message || result.error || '価格更新に失敗しました',
        result.productName || `商品ID: ${result.productId}`
      );
    }
  }
}

// ログ追加用のヘルパー関数
async function addLog(type, message, productName = null, oldPrice = null, newPrice = null) {
  const log = {
    timestamp: new Date().toISOString(),
    type: type,
    message: message,
    productName: productName,
    oldPrice: oldPrice,
    newPrice: newPrice
  };
  
  const result = await chrome.storage.local.get(['executionLogs']);
  const logs = result.executionLogs || [];
  logs.unshift(log);
  
  // ログは最新100件まで保持
  if (logs.length > 100) {
    logs.splice(100);
  }
  
  await chrome.storage.local.set({ executionLogs: logs });
}
