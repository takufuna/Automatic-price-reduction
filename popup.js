// Popup Script for メルカリ価格調整ツール

// DOM要素の取得
const statusCard = document.getElementById('statusCard');
const statusIcon = document.getElementById('statusIcon');
const statusText = document.getElementById('statusText');
const statusDetail = document.getElementById('statusDetail');
const nextExecution = document.getElementById('nextExecution');
const toggleBtn = document.getElementById('toggleBtn');
const scanBtn = document.getElementById('scanBtn');
const settingsBtn = document.getElementById('settingsBtn');
const minPriceInput = document.getElementById('minPrice');
const reductionInput = document.getElementById('reduction');
const startTimeInput = document.getElementById('startTime');
const endTimeInput = document.getElementById('endTime');
const productList = document.getElementById('productList');
const productCount = document.getElementById('productCount');
const selectedCount = document.getElementById('selectedCount');
const selectedCountText = document.getElementById('selectedCountText');
const selectionControls = document.getElementById('selectionControls');
const selectAllBtn = document.getElementById('selectAllBtn');
const selectNoneBtn = document.getElementById('selectNoneBtn');
const selectHighPriceBtn = document.getElementById('selectHighPriceBtn');
const selectLowPriceBtn = document.getElementById('selectLowPriceBtn');
const adjustSelectedSection = document.getElementById('adjustSelectedSection');
const adjustSelectedBtn = document.getElementById('adjustSelectedBtn');
const logs = document.getElementById('logs');

// 状態管理
let currentSettings = {
  isEnabled: false,
  minPrice: 300,
  reduction: 100,
  startTime: '09:00',
  endTime: '21:00',
  selectedProducts: [],
  executionLogs: []
};

// 商品選択状態
let allProducts = [];
let selectedProductIds = new Set();

// 初期化
document.addEventListener('DOMContentLoaded', async () => {
  console.log('ポップアップ初期化開始');
  await loadSettings();
  await loadProducts();
  await loadLogs();
  setupEventListeners();
  updateUI();
  console.log('ポップアップ初期化完了');
});

// イベントリスナーの設定
function setupEventListeners() {
  // メインボタン
  toggleBtn.addEventListener('click', handleToggleClick);
  scanBtn.addEventListener('click', handleScanClick);
  settingsBtn.addEventListener('click', handleSettingsClick);
  
  // 設定入力フィールド
  minPriceInput.addEventListener('change', handleSettingChange);
  reductionInput.addEventListener('change', handleSettingChange);
  startTimeInput.addEventListener('change', handleSettingChange);
  endTimeInput.addEventListener('change', handleSettingChange);
  
  // 選択コントロールボタン
  selectAllBtn.addEventListener('click', handleSelectAll);
  selectNoneBtn.addEventListener('click', handleSelectNone);
  selectHighPriceBtn.addEventListener('click', handleSelectHighPrice);
  selectLowPriceBtn.addEventListener('click', handleSelectLowPrice);
  adjustSelectedBtn.addEventListener('click', handleAdjustSelected);
  
  // リアルタイム保存
  [minPriceInput, reductionInput, startTimeInput, endTimeInput].forEach(input => {
    input.addEventListener('blur', saveSettings);
  });
}

// 設定の読み込み
async function loadSettings() {
  try {
    const result = await chrome.storage.local.get([
      'isEnabled',
      'minPrice', 
      'reduction',
      'startTime',
      'endTime',
      'selectedProducts',
      'executionLogs'
    ]);
    
    currentSettings = {
      isEnabled: result.isEnabled || false,
      minPrice: result.minPrice || 300,
      reduction: result.reduction || 100,
      startTime: result.startTime || '09:00',
      endTime: result.endTime || '21:00',
      selectedProducts: result.selectedProducts || [],
      executionLogs: result.executionLogs || []
    };
    
    // UIに反映
    minPriceInput.value = currentSettings.minPrice;
    reductionInput.value = currentSettings.reduction;
    startTimeInput.value = currentSettings.startTime;
    endTimeInput.value = currentSettings.endTime;
    
    console.log('設定読み込み完了:', currentSettings);
  } catch (error) {
    console.error('設定の読み込みに失敗:', error);
    addLog('設定の読み込みに失敗しました', 'error');
  }
}

// 設定の保存
async function saveSettings() {
  try {
    currentSettings.minPrice = parseInt(minPriceInput.value) || 300;
    currentSettings.reduction = parseInt(reductionInput.value) || 100;
    currentSettings.startTime = startTimeInput.value || '09:00';
    currentSettings.endTime = endTimeInput.value || '21:00';
    
    await chrome.storage.local.set(currentSettings);
    
    // バックグラウンドスクリプトに通知
    await chrome.runtime.sendMessage({
      action: 'settingsUpdated',
      settings: currentSettings
    });
    
    console.log('設定保存完了:', currentSettings);
  } catch (error) {
    console.error('設定の保存に失敗:', error);
    addLog('設定の保存に失敗しました', 'error');
  }
}

// 商品の読み込み
async function loadProducts() {
  try {
    const result = await chrome.storage.local.get(['selectedProducts']);
    currentSettings.selectedProducts = result.selectedProducts || [];
    
    displayProducts(currentSettings.selectedProducts);
    console.log('商品読み込み完了:', currentSettings.selectedProducts.length + '件');
  } catch (error) {
    console.error('商品の読み込みに失敗:', error);
    addLog('商品の読み込みに失敗しました', 'error');
  }
  
  // サンプルデータを追加（デバッグ用）
  if (currentSettings.selectedProducts.length === 0) {
    const sampleProducts = [
      { id: 'sample1', name: 'iPhone 13 Pro 128GB', price: 85000, url: '#' },
      { id: 'sample2', name: 'Nintendo Switch 本体', price: 28000, url: '#' },
      { id: 'sample3', name: 'AirPods Pro 第2世代', price: 25000, url: '#' },
      { id: 'sample4', name: 'ブランドバッグ', price: 15000, url: '#' },
      { id: 'sample5', name: 'スニーカー 27cm', price: 8000, url: '#' }
    ];
    
    console.log('サンプルデータを表示中');
    displayProducts(sampleProducts);
  }
}

// ログの読み込み
async function loadLogs() {
  try {
    const result = await chrome.storage.local.get(['executionLogs']);
    currentSettings.executionLogs = result.executionLogs || [];
    
    displayLogs(currentSettings.executionLogs);
    console.log('ログ読み込み完了:', currentSettings.executionLogs.length + '件');
  } catch (error) {
    console.error('ログの読み込みに失敗:', error);
    addLog('ログの読み込みに失敗しました', 'error');
  }
}

// UI更新
function updateUI() {
  // ステータスカードの更新
  if (currentSettings.isEnabled) {
    statusCard.className = 'status-card enabled';
    statusIcon.textContent = '🟢';
    statusText.textContent = '自動実行中';
    statusDetail.textContent = '価格調整が有効です';
    toggleBtn.innerHTML = '<span>⏸️</span>停止';
    toggleBtn.className = 'toggle-btn stop';
  } else {
    statusCard.className = 'status-card disabled';
    statusIcon.textContent = '🔴';
    statusText.textContent = '停止中';
    statusDetail.textContent = '価格調整が無効です';
    toggleBtn.innerHTML = '<span>▶️</span>開始';
    toggleBtn.className = 'toggle-btn start';
  }
  
  // 次回実行時間の表示
  if (currentSettings.isEnabled) {
    const nextTime = getNextExecutionTime();
    nextExecution.textContent = `次回実行: ${nextTime}`;
    nextExecution.style.display = 'block';
  } else {
    nextExecution.style.display = 'none';
  }
  
  // 商品数の表示
  productCount.textContent = `${currentSettings.selectedProducts.length}件の商品`;
}

// 商品表示
function displayProducts(products) {
  console.log('displayProducts関数が呼び出されました');
  console.log('受信した商品データ:', products);
  console.log('商品数:', products ? products.length : 0);
  
  allProducts = products || [];
  console.log('allProductsに設定:', allProducts.length, '件');
  
  // DOM要素の存在確認
  console.log('productList要素:', productList ? '存在' : 'なし');
  console.log('selectionControls要素:', selectionControls ? '存在' : 'なし');
  console.log('adjustSelectedSection要素:', adjustSelectedSection ? '存在' : 'なし');
  
  if (allProducts.length === 0) {
    productList.innerHTML = `
      <div class="no-products">
        <div class="icon">📦</div>
        <div>商品をスキャンしてください</div>
      </div>
    `;
    selectionControls.style.display = 'none';
    selectedCount.style.display = 'none';
    adjustSelectedSection.style.display = 'none';
    productCount.textContent = '0';
    return;
  }
  
  // 商品リストのHTMLを生成
  console.log('商品HTML生成を開始...');
  const productsHtml = allProducts.map((product, index) => {
    console.log(`商品 ${index + 1} のHTML生成:`, {
      id: product.id,
      name: product.name,
      price: product.price,
      url: product.url
    });
    
    const productId = product.id || product.productId || `product_${index}`;
    const isSelected = selectedProductIds.has(productId);
    const priceDisplay = formatPrice(product.price);
    const productUrl = product.url || '#';
    
    console.log(`商品ID: ${productId}, 選択状態: ${isSelected}, 価格表示: ${priceDisplay}`);
    
    const htmlContent = `
      <div class="product-item ${isSelected ? 'selected' : ''}" data-product-id="${productId}">
        <input type="checkbox" class="product-checkbox" ${isSelected ? 'checked' : ''}>
        <div class="product-info">
          <div class="product-name" title="${product.name || '商品名不明'}">
            ${product.name || '商品名不明'}
          </div>
          <div class="product-price">${priceDisplay}</div>
          <a href="${productUrl}" class="product-url" target="_blank">
            商品ページを開く
          </a>
        </div>
      </div>
    `;
    
    console.log(`商品 ${index + 1} のHTML:`, htmlContent.substring(0, 100) + '...');
    return htmlContent;
  }).join('');
  
  // 商品リストにHTMLを設定
  console.log('生成したHTMLの長さ:', productsHtml.length);
  console.log('HTMLの最初の100文字:', productsHtml.substring(0, 100));
  
  if (productList) {
    productList.innerHTML = productsHtml;
    console.log('productListにHTMLを設定完了');
    console.log('設定後のproductList.children.length:', productList.children.length);
  } else {
    console.error('productList要素が見つかりません');
  }
  
  // コントロールを表示
  if (selectionControls) {
    selectionControls.style.display = 'flex';
    console.log('selectionControlsを表示');
  }
  
  // 商品数と選択状態を更新
  console.log('updateSelectionUIを呼び出し中...');
  updateSelectionUI();
  console.log('updateSelectionUI完了');
  
  // 商品アイテムのイベントリスナーを追加
  document.querySelectorAll('.product-item').forEach(item => {
    const checkbox = item.querySelector('.product-checkbox');
    const productId = item.dataset.productId;
    const productLink = item.querySelector('.product-url');
    
    // チェックボックスのイベント
    checkbox.addEventListener('change', (e) => {
      e.stopPropagation();
      toggleProductSelection(productId);
    });
    
    // 商品アイテム全体のクリックイベント
    item.addEventListener('click', (e) => {
      // リンクやチェックボックスをクリックした場合は除外
      if (e.target.tagName === 'A' || e.target.type === 'checkbox') {
        return;
      }
      
      // チェックボックスの状態を切り替え
      checkbox.checked = !checkbox.checked;
      toggleProductSelection(productId);
    });
    
    // リンクのクリックイベント（イベント伝播を停止）
    productLink.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  });
}

// 商品選択状態を更新
function updateSelectionUI() {
  const selectedCount = selectedProductIds.size;
  const totalCount = allProducts.length;
  
  // 商品数表示を更新
  productCount.textContent = totalCount;
  
  // 選択数表示を更新
  if (selectedCount > 0) {
    selectedCountText.textContent = `${selectedCount}件選択中`;
    document.getElementById('selectedCount').style.display = 'block';
    adjustSelectedSection.style.display = 'block';
  } else {
    document.getElementById('selectedCount').style.display = 'none';
    adjustSelectedSection.style.display = 'none';
  }
}

// 商品選択状態を切り替え
function toggleProductSelection(productId) {
  if (selectedProductIds.has(productId)) {
    selectedProductIds.delete(productId);
  } else {
    selectedProductIds.add(productId);
  }
  
  // UIを更新
  const productItem = document.querySelector(`[data-product-id="${productId}"]`);
  if (productItem) {
    productItem.classList.toggle('selected', selectedProductIds.has(productId));
  }
  
  updateSelectionUI();
}

// 全選択
function handleSelectAll() {
  allProducts.forEach(product => {
    selectedProductIds.add(product.id);
  });
  
  // チェックボックを更新
  document.querySelectorAll('.product-checkbox').forEach(checkbox => {
    checkbox.checked = true;
  });
  
  // アイテムのスタイルを更新
  document.querySelectorAll('.product-item').forEach(item => {
    item.classList.add('selected');
  });
  
  updateSelectionUI();
}

// 全解除
function handleSelectNone() {
  selectedProductIds.clear();
  
  // チェックボックを更新
  document.querySelectorAll('.product-checkbox').forEach(checkbox => {
    checkbox.checked = false;
  });
  
  // アイテムのスタイルを更新
  document.querySelectorAll('.product-item').forEach(item => {
    item.classList.remove('selected');
  });
  
  updateSelectionUI();
}

// 高額商品選択
function handleSelectHighPrice() {
  if (allProducts.length === 0) return;
  
  // 価格でソートして上位50%を選択
  const sortedProducts = [...allProducts].sort((a, b) => b.price - a.price);
  const topHalf = sortedProducts.slice(0, Math.ceil(sortedProducts.length / 2));
  
  selectedProductIds.clear();
  topHalf.forEach(product => {
    selectedProductIds.add(product.id);
  });
  
  // UIを更新
  document.querySelectorAll('.product-item').forEach(item => {
    const productId = item.dataset.productId;
    const isSelected = selectedProductIds.has(productId);
    item.classList.toggle('selected', isSelected);
    item.querySelector('.product-checkbox').checked = isSelected;
  });
  
  updateSelectionUI();
}

// 低額商品選択
function handleSelectLowPrice() {
  if (allProducts.length === 0) return;
  
  // 価格でソートして下位50%を選択
  const sortedProducts = [...allProducts].sort((a, b) => a.price - b.price);
  const bottomHalf = sortedProducts.slice(0, Math.ceil(sortedProducts.length / 2));
  
  selectedProductIds.clear();
  bottomHalf.forEach(product => {
    selectedProductIds.add(product.id);
  });
  
  // UIを更新
  document.querySelectorAll('.product-item').forEach(item => {
    const productId = item.dataset.productId;
    const isSelected = selectedProductIds.has(productId);
    item.classList.toggle('selected', isSelected);
    item.querySelector('.product-checkbox').checked = isSelected;
  });
  
  updateSelectionUI();
}

// 選択商品の価格調整
async function handleAdjustSelected() {
  if (selectedProductIds.size === 0) {
    alert('商品を選択してください');
    return;
  }
  
  // 選択された商品を取得
  const selectedProducts = allProducts.filter(product => selectedProductIds.has(product.id));
  
  const confirmMessage = `${selectedProducts.length}件の商品を${currentSettings.reduction}円値下げしますか？`;
  if (!confirm(confirmMessage)) {
    return;
  }
  
  // 送信用に軽量化し、価格を数値に正規化
  const compactProducts = selectedProducts.map(p => ({
    id: p.id,
    price: typeof p.price === 'string' ? parseInt(String(p.price).replace(/[^\d]/g, ''), 10) : p.price
  }));
  
  try {
    adjustSelectedBtn.disabled = true;
    adjustSelectedBtn.innerHTML = '<span>⏳</span>処理中...';
    
    // タブ情報を取得
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // コンテンツスクリプトに価格調整を依頼
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: 'adjustPrices',
      products: compactProducts,
      reduction: currentSettings.reduction,
      minPrice: currentSettings.minPrice
    });
    
    if (response && response.success) {
      addLog(`${selectedProducts.length}件の商品の価格調整を開始しました`, 'success');
      
      // 選択をクリア
      handleSelectNone();
    } else {
      throw new Error(response?.error || '価格調整に失敗しました');
    }
    
  } catch (error) {
    console.error('価格調整エラー:', error);
    addLog(`価格調整エラー: ${error.message}`, 'error');
    alert(`価格調整に失敗しました: ${error.message}`);
  } finally {
    adjustSelectedBtn.disabled = false;
    adjustSelectedBtn.innerHTML = '<span>💰</span>選択商品を値下げ';
  }
}

// ログ表示
function displayLogs(logEntries) {
  if (!logEntries || logEntries.length === 0) {
    logs.innerHTML = `
      <div class="empty-state">
        <span>📝</span>
        <p>ログがありません</p>
      </div>
    `;
    return;
  }
  
  const logsHtml = logEntries.slice(0, 10).map(log => {
    const date = new Date(log.timestamp);
    const timeString = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    
    let badgeClass = 'info';
    if (log.type === 'error') badgeClass = 'error';
    else if (log.type === 'success') badgeClass = 'success';
    
    return `
      <div class="log-item">
        <span class="badge ${badgeClass}">${timeString}</span>
        <span class="log-message">${log.message}</span>
      </div>
    `;
  }).join('');
  
  logs.innerHTML = logsHtml;
}

// ログ追加
function addLog(message, type = 'info') {
  const logEntry = {
    timestamp: Date.now(),
    message: message,
    type: type
  };
  
  currentSettings.executionLogs.unshift(logEntry);
  
  // 最大100件まで保持
  if (currentSettings.executionLogs.length > 100) {
    currentSettings.executionLogs = currentSettings.executionLogs.slice(0, 100);
  }
  
  // ストレージに保存
  chrome.storage.local.set({ executionLogs: currentSettings.executionLogs });
  
  // UI更新
  displayLogs(currentSettings.executionLogs);
}

// 次回実行時間を取得
function getNextExecutionTime() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const startHour = parseInt(currentSettings.startTime.split(':')[0]);
  const endHour = parseInt(currentSettings.endTime.split(':')[0]);
  const randomHour = Math.floor(Math.random() * (endHour - startHour + 1)) + startHour;
  const randomMinute = Math.floor(Math.random() * 60);
  
  tomorrow.setHours(randomHour, randomMinute, 0, 0);
  
  return `${tomorrow.getMonth() + 1}/${tomorrow.getDate()} ${randomHour}:${randomMinute.toString().padStart(2, '0')}`;
}

// 設定変更ハンドラー
function handleSettingChange() {
  saveSettings();
  updateUI();
}

// UI更新
function updateUI() {
  console.log('UIを更新中...');
  
  // ステータス表示を更新
  if (currentSettings.isEnabled) {
    statusIcon.textContent = '✅';
    statusText.textContent = '自動実行中';
    statusDetail.textContent = '毎日ランダムな時間に実行されます';
    statusCard.className = 'status-card enabled';
    toggleBtn.innerHTML = '<span>⏸️</span>停止';
    toggleBtn.className = 'btn btn-danger';
    
    // 次回実行時間を表示
    nextExecution.textContent = `次回実行: ${getNextExecutionTime()}`;
  } else {
    statusIcon.textContent = '⏸️';
    statusText.textContent = '停止中';
    statusDetail.textContent = '自動実行は停止しています';
    statusCard.className = 'status-card stopped';
    toggleBtn.innerHTML = '<span>▶️</span>開始';
    toggleBtn.className = 'btn btn-primary';
    nextExecution.textContent = '';
  }
  
  // 商品数を更新
  if (productCount) {
    productCount.textContent = allProducts.length;
  }
  
  console.log('UI更新完了');
}

// イベントハンドラー関数

// トグルボタンのクリックハンドラー
async function handleToggleClick() {
  try {
    console.log('トグルボタンがクリックされました');
    
    if (currentSettings.isEnabled) {
      // 停止処理
      currentSettings.isEnabled = false;
      await chrome.storage.local.set({ isEnabled: false });
      
      // バックグラウンドスクリプトに停止を通知
      await chrome.runtime.sendMessage({ action: 'stopExecution' });
      
      addLog('自動実行を停止しました', 'info');
      console.log('自動実行を停止しました');
    } else {
      // 開始前の確認ダイアログ
      const confirmed = confirm('自動価格調整を開始しますか？\n\n注意：テストアカウントでの使用を推奨します。');
      
      if (confirmed) {
        // 開始処理
        currentSettings.isEnabled = true;
        await chrome.storage.local.set({ isEnabled: true });
        
        // バックグラウンドスクリプトに開始を通知
        await chrome.runtime.sendMessage({ action: 'startExecution' });
        
        addLog('自動実行を開始しました', 'success');
        console.log('自動実行を開始しました');
      }
    }
    
    updateUI();
  } catch (error) {
    console.error('トグル処理エラー:', error);
    addLog('操作に失敗しました', 'error');
  }
}

// スキャンボタンのクリックハンドラー
async function handleScanClick() {
  try {
    console.log('スキャンボタンがクリックされました');
    
    // ボタンを無効化してローディング表示
    scanBtn.disabled = true;
    scanBtn.innerHTML = '<span>⏳</span>スキャン中...';
    
    addLog('商品スキャンを開始しました', 'info');
    
    // アクティブなタブを取得
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    console.log('現在のタブURL:', tab.url);
    
    // URLチェックを緩和（テスト用にローカルファイルも許可）
    if (!tab.url.includes('mercari.com') && !tab.url.startsWith('file://') && !tab.url.includes('localhost')) {
      throw new Error('メルカリのページまたはテストページで実行してください');
    }
    
    // コンテンツスクリプトが注入されているか確認
    let response;
    try {
      console.log('コンテンツスクリプトにメッセージ送信中...');
      // まずコンテンツスクリプトにメッセージを送信
      response = await chrome.tabs.sendMessage(tab.id, { action: 'scanProducts' });
      console.log('コンテンツスクリプトからのレスポンス:', response);
    } catch (connectionError) {
      console.log('接続エラー:', connectionError.message);
      console.log('コンテンツスクリプトが注入されていないため、手動で注入します...');
      
      try {
        // コンテンツスクリプトを手動で注入
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
        console.log('コンテンツスクリプトの注入が完了しました');
        
        // 少し待ってから再度メッセージ送信
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('再度メッセージ送信を試行中...');
        response = await chrome.tabs.sendMessage(tab.id, { action: 'scanProducts' });
        console.log('再送信後のレスポンス:', response);
      } catch (injectionError) {
        console.error('コンテンツスクリプトの注入に失敗:', injectionError);
        throw new Error(`コンテンツスクリプトの注入に失敗: ${injectionError.message}`);
      }
    }
    
    if (response && response.success) {
      const products = response.data || [];
      console.log('スキャン結果:', products);
      console.log('受信した商品数:', products.length);
      
      // 各商品の詳細情報をログ出力
      products.forEach((product, index) => {
        console.log(`ポップアップで受信した商品 ${index + 1}:`, {
          id: product.id,
          name: product.name,
          price: product.price,
          url: product.url,
          productId: product.productId
        });
      });
      
      if (products.length > 0) {
        // 商品情報を保存
        currentSettings.selectedProducts = products;
        await chrome.storage.local.set({ selectedProducts: products });
        
        console.log('商品表示処理を開始...');
        displayProducts(products);
        console.log('商品表示処理完了');
        addLog(`${products.length}件の商品を検出しました`, 'success');
      } else {
        console.log('商品が0件のため警告表示');
        addLog('商品が見つかりませんでした', 'warning');
      }
    } else {
      console.error('スキャンレスポンスエラー:', response);
      throw new Error(response?.error || 'スキャンに失敗しました');
    }
    
  } catch (error) {
    console.error('スキャンエラー:', error);
    addLog(`スキャンエラー: ${error.message}`, 'error');
  } finally {
    // ボタンを復元
    scanBtn.disabled = false;
    scanBtn.innerHTML = '<span>🔍</span>商品スキャン';
  }
}

// 設定ボタンのクリックハンドラー
async function handleSettingsClick() {
  try {
    console.log('設定ボタンがクリックされました');
    
    // 設定ページを開く（将来の拡張用）
    addLog('設定機能は現在ポップアップ内で利用できます', 'info');
    
  } catch (error) {
    console.error('設定エラー:', error);
    addLog('設定の操作に失敗しました', 'error');
  }
}

// ユーティリティ関数

// 価格をフォーマット
function formatPrice(price) {
  if (!price || price === 0) {
    return '価格不明';
  }
  return `￥${price.toLocaleString()}`;
}

// 日時をフォーマット
function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('ja-JP');
}

// イベントリスナーの設定
function setupEventListeners() {
  console.log('イベントリスナーを設定中...');
  
  // トグルボタン
  if (toggleBtn) {
    toggleBtn.addEventListener('click', handleToggleClick);
    console.log('トグルボタンのイベントリスナーを設定');
  }
  
  // スキャンボタン
  if (scanBtn) {
    scanBtn.addEventListener('click', handleScanClick);
    console.log('スキャンボタンのイベントリスナーを設定');
  }
  
  // 設定ボタン
  if (settingsBtn) {
    settingsBtn.addEventListener('click', handleSettingsClick);
    console.log('設定ボタンのイベントリスナーを設定');
  }
  
  // 設定入力フィールド
  if (minPriceInput) {
    minPriceInput.addEventListener('change', handleSettingChange);
  }
  if (reductionInput) {
    reductionInput.addEventListener('change', handleSettingChange);
  }
  if (startTimeInput) {
    startTimeInput.addEventListener('change', handleSettingChange);
  }
  if (endTimeInput) {
    endTimeInput.addEventListener('change', handleSettingChange);
  }
  
  // 選択コントロールボタン
  if (selectAllBtn) {
    selectAllBtn.addEventListener('click', handleSelectAll);
  }
  if (selectNoneBtn) {
    selectNoneBtn.addEventListener('click', handleSelectNone);
  }
  if (selectHighPriceBtn) {
    selectHighPriceBtn.addEventListener('click', handleSelectHighPrice);
  }
  if (selectLowPriceBtn) {
    selectLowPriceBtn.addEventListener('click', handleSelectLowPrice);
  }
  if (adjustSelectedBtn) {
    adjustSelectedBtn.addEventListener('click', handleAdjustSelected);
  }
  
  console.log('イベントリスナーの設定完了');
}

// グローバル関数としてエクスポート（HTMLから呼び出されるため）
window.toggleProductSelection = toggleProductSelection;
window.handleSelectAll = handleSelectAll;
window.handleSelectNone = handleSelectNone;
window.handleSelectHighPrice = handleSelectHighPrice;
window.handleSelectLowPrice = handleSelectLowPrice;
window.handleAdjustSelected = handleAdjustSelected;

console.log('ポップアップスクリプト読み込み完了');
