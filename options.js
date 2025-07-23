// Options Script for メルカリ価格調整ツール

document.addEventListener('DOMContentLoaded', async () => {
  console.log('オプション画面初期化開始');
  
  // 設定の読み込み
  await loadSettings();
  
  // イベントリスナーの設定
  setupEventListeners();
  
  console.log('オプション画面初期化完了');
});

// デフォルト設定
const DEFAULT_SETTINGS = {
  isEnabled: false,
  minPrice: 300,
  priceReduction: 100,
  startTime: '09:00',
  endTime: '21:00',
  executionInterval: 1,
  maxProductsPerDay: 10,
  requestDelay: 5,
  confirmBeforeExecution: true,
  enableNotifications: true,
  notifyOnSuccess: true,
  notifyOnError: true,
  dailySummary: false,
  logRetentionDays: 30,
  detailedLogging: false
};

// 設定の読み込み
async function loadSettings() {
  try {
    const result = await chrome.storage.local.get(Object.keys(DEFAULT_SETTINGS));
    
    // デフォルト値とマージ
    const settings = { ...DEFAULT_SETTINGS, ...result };
    
    // フォームに設定値を反映
    document.getElementById('enableExtension').checked = settings.isEnabled;
    document.getElementById('minPrice').value = settings.minPrice;
    document.getElementById('priceReduction').value = settings.priceReduction;
    document.getElementById('startTime').value = settings.startTime;
    document.getElementById('endTime').value = settings.endTime;
    document.getElementById('executionInterval').value = settings.executionInterval;
    document.getElementById('maxProductsPerDay').value = settings.maxProductsPerDay;
    document.getElementById('requestDelay').value = settings.requestDelay;
    document.getElementById('confirmBeforeExecution').checked = settings.confirmBeforeExecution;
    document.getElementById('enableNotifications').checked = settings.enableNotifications;
    document.getElementById('notifyOnSuccess').checked = settings.notifyOnSuccess;
    document.getElementById('notifyOnError').checked = settings.notifyOnError;
    document.getElementById('dailySummary').checked = settings.dailySummary;
    document.getElementById('logRetentionDays').value = settings.logRetentionDays;
    document.getElementById('detailedLogging').checked = settings.detailedLogging;
    
    console.log('設定を読み込みました:', settings);
    
  } catch (error) {
    console.error('設定読み込みエラー:', error);
    showStatusMessage('設定の読み込みに失敗しました', 'error');
  }
}

// イベントリスナーの設定
function setupEventListeners() {
  // 保存ボタン
  document.getElementById('saveSettings').addEventListener('click', saveSettings);
  
  // リセットボタン
  document.getElementById('resetSettings').addEventListener('click', resetSettings);
  
  // エクスポート・インポート
  document.getElementById('exportSettings').addEventListener('click', exportSettings);
  document.getElementById('importSettings').addEventListener('click', () => {
    document.getElementById('importFile').click();
  });
  document.getElementById('importFile').addEventListener('change', importSettings);
  
  // ログエクスポート
  document.getElementById('exportLogs').addEventListener('click', exportLogs);
  
  // 全データクリア
  document.getElementById('clearAllData').addEventListener('click', clearAllData);
  
  // リアルタイム設定変更の監視
  const inputs = document.querySelectorAll('input, select');
  inputs.forEach(input => {
    input.addEventListener('change', onSettingChange);
  });
}

// 設定変更時の処理
function onSettingChange(event) {
  // 保存ボタンを強調表示
  const saveButton = document.getElementById('saveSettings');
  saveButton.style.background = '#ffc107';
  saveButton.textContent = '設定を保存 *';
  
  // バリデーション
  validateInput(event.target);
}

// 入力値のバリデーション
function validateInput(input) {
  const value = input.type === 'checkbox' ? input.checked : input.value;
  let isValid = true;
  
  switch (input.id) {
    case 'minPrice':
      isValid = value >= 100;
      break;
    case 'priceReduction':
      isValid = value >= 50;
      break;
    case 'maxProductsPerDay':
      isValid = value >= 1 && value <= 50;
      break;
    case 'requestDelay':
      isValid = value >= 1 && value <= 60;
      break;
    case 'startTime':
    case 'endTime':
      // 時間の妥当性チェック
      const startTime = document.getElementById('startTime').value;
      const endTime = document.getElementById('endTime').value;
      if (startTime && endTime) {
        isValid = startTime < endTime;
      }
      break;
  }
  
  // エラー表示の切り替え
  if (isValid) {
    input.classList.remove('input-error');
  } else {
    input.classList.add('input-error');
  }
  
  return isValid;
}

// 設定の保存
async function saveSettings() {
  const saveButton = document.getElementById('saveSettings');
  
  try {
    saveButton.disabled = true;
    saveButton.textContent = '保存中...';
    
    // 全ての入力値をバリデーション
    const inputs = document.querySelectorAll('input, select');
    let allValid = true;
    
    inputs.forEach(input => {
      if (!validateInput(input)) {
        allValid = false;
      }
    });
    
    if (!allValid) {
      showStatusMessage('入力値に誤りがあります', 'error');
      return;
    }
    
    // 設定値を収集
    const settings = {
      isEnabled: document.getElementById('enableExtension').checked,
      minPrice: parseInt(document.getElementById('minPrice').value),
      priceReduction: parseInt(document.getElementById('priceReduction').value),
      startTime: document.getElementById('startTime').value,
      endTime: document.getElementById('endTime').value,
      executionInterval: parseInt(document.getElementById('executionInterval').value),
      maxProductsPerDay: parseInt(document.getElementById('maxProductsPerDay').value),
      requestDelay: parseInt(document.getElementById('requestDelay').value),
      confirmBeforeExecution: document.getElementById('confirmBeforeExecution').checked,
      enableNotifications: document.getElementById('enableNotifications').checked,
      notifyOnSuccess: document.getElementById('notifyOnSuccess').checked,
      notifyOnError: document.getElementById('notifyOnError').checked,
      dailySummary: document.getElementById('dailySummary').checked,
      logRetentionDays: parseInt(document.getElementById('logRetentionDays').value),
      detailedLogging: document.getElementById('detailedLogging').checked
    };
    
    // ストレージに保存
    await chrome.storage.local.set(settings);
    
    // バックグラウンドスクリプトに設定変更を通知
    try {
      await chrome.runtime.sendMessage({
        action: 'settingsUpdated',
        settings: settings
      });
    } catch (error) {
      console.warn('バックグラウンドスクリプトへの通知に失敗:', error);
    }
    
    showStatusMessage('設定を保存しました', 'success');
    
    // ボタンの状態をリセット
    saveButton.style.background = '#ff6b6b';
    saveButton.textContent = '設定を保存';
    
    console.log('設定を保存しました:', settings);
    
  } catch (error) {
    console.error('設定保存エラー:', error);
    showStatusMessage('設定の保存に失敗しました', 'error');
  } finally {
    saveButton.disabled = false;
  }
}

// 設定のリセット
async function resetSettings() {
  if (!confirm('設定をデフォルト値に戻しますか？この操作は元に戻せません。')) {
    return;
  }
  
  try {
    // デフォルト設定を保存
    await chrome.storage.local.set(DEFAULT_SETTINGS);
    
    // フォームを更新
    await loadSettings();
    
    showStatusMessage('設定をデフォルト値に戻しました', 'success');
    
  } catch (error) {
    console.error('設定リセットエラー:', error);
    showStatusMessage('設定のリセットに失敗しました', 'error');
  }
}

// 設定のエクスポート
async function exportSettings() {
  try {
    const settings = await chrome.storage.local.get(Object.keys(DEFAULT_SETTINGS));
    
    const exportData = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      settings: settings
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mercari-price-tool-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showStatusMessage('設定をエクスポートしました', 'success');
    
  } catch (error) {
    console.error('設定エクスポートエラー:', error);
    showStatusMessage('設定のエクスポートに失敗しました', 'error');
  }
}

// 設定のインポート
async function importSettings(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  try {
    const text = await file.text();
    const importData = JSON.parse(text);
    
    // データの妥当性チェック
    if (!importData.settings || typeof importData.settings !== 'object') {
      throw new Error('無効な設定ファイルです');
    }
    
    // 設定をマージ（デフォルト値で不足分を補完）
    const settings = { ...DEFAULT_SETTINGS, ...importData.settings };
    
    // ストレージに保存
    await chrome.storage.local.set(settings);
    
    // フォームを更新
    await loadSettings();
    
    showStatusMessage('設定をインポートしました', 'success');
    
  } catch (error) {
    console.error('設定インポートエラー:', error);
    showStatusMessage('設定のインポートに失敗しました', 'error');
  } finally {
    // ファイル入力をリセット
    event.target.value = '';
  }
}

// ログのエクスポート
async function exportLogs() {
  try {
    const result = await chrome.storage.local.get(['executionLogs']);
    const logs = result.executionLogs || [];
    
    if (logs.length === 0) {
      showStatusMessage('エクスポートするログがありません', 'warning');
      return;
    }
    
    const exportData = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      logs: logs
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mercari-price-tool-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showStatusMessage('ログをエクスポートしました', 'success');
    
  } catch (error) {
    console.error('ログエクスポートエラー:', error);
    showStatusMessage('ログのエクスポートに失敗しました', 'error');
  }
}

// 全データのクリア
async function clearAllData() {
  const confirmation = prompt(
    '全てのデータ（設定、ログ、商品情報）を削除します。\n' +
    'この操作は元に戻せません。\n' +
    '続行するには「DELETE」と入力してください:'
  );
  
  if (confirmation !== 'DELETE') {
    return;
  }
  
  try {
    // 全データをクリア
    await chrome.storage.local.clear();
    
    // デフォルト設定を復元
    await chrome.storage.local.set(DEFAULT_SETTINGS);
    
    // フォームを更新
    await loadSettings();
    
    showStatusMessage('全データをクリアしました', 'success');
    
  } catch (error) {
    console.error('データクリアエラー:', error);
    showStatusMessage('データのクリアに失敗しました', 'error');
  }
}

// ステータスメッセージの表示
function showStatusMessage(message, type = 'success') {
  const statusMessage = document.getElementById('statusMessage');
  
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type} show`;
  
  setTimeout(() => {
    statusMessage.classList.remove('show');
  }, 5000);
}

// ユーティリティ関数
function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('ja-JP');
}

function validateTimeRange(startTime, endTime) {
  if (!startTime || !endTime) return false;
  
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  
  return start < end;
}

console.log('オプションスクリプト読み込み完了');
