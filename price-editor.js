// メルカリ商品編集ページでの価格変更処理
console.log('🔧 価格編集スクリプトが読み込まれました');
console.log('📍 現在のURL:', window.location.href);
console.log('📄 ページタイトル:', document.title);

// スクリプトが正しく読み込まれたことを確認
if (window.location.href.includes('/sell/edit/')) {
  console.log('✅ 編集ページでスクリプトが実行されています');
} else {
  console.warn('⚠️ 編集ページではないページでスクリプトが実行されました');
}

// 価格更新関数
async function updateProductPrice(productId, newPrice) {
  console.log(`商品ID ${productId} の価格を ${newPrice}円 に変更開始`);
  
  // デバッグ: 現在のページ情報を出力
  console.log('現在のURL:', window.location.href);
  console.log('ページタイトル:', document.title);
  
  // 商品詳細ページの場合は編集ページに移動
  if (window.location.href.includes('/item/')) {
    console.log('🔄 商品詳細ページから編集ページに移動中...');
    const editUrl = window.location.href.replace('/item/', '/sell/edit/');
    console.log('編集ページURL:', editUrl);
    window.location.href = editUrl;
    return { success: false, message: '編集ページに移動中...' };
  }
  
  // 編集ページでない場合はエラー
  if (!window.location.href.includes('/sell/edit/')) {
    throw new Error('編集ページではありません: ' + window.location.href);
  }
  
  // DOM全体をデバッグ
  debugPageStructure();
  
  try {
    // 価格入力フィールドを探して値を設定
    const priceInput = await waitForElement([
      'input[name="price"]',
      'input[data-testid="price-input"]',
      'input[placeholder*="価格"]',
      'input[id*="price"]',
      'input[class*="price"]'
    ], 10000);
    
    if (!priceInput) {
      throw new Error('価格入力フィールドが見つかりません');
    }
    
    console.log('価格入力フィールドを発見:', priceInput);
    console.log(` 価格入力デバッグ:`);
    console.log(`  - 元の価格: ${priceInput.value}`);
    console.log(`  - 新しい価格: ${newPrice} (typeof: ${typeof newPrice})`);
    
    // 現在の価格をクリアして新しい価格を入力
    priceInput.focus();
    priceInput.select();
    priceInput.value = newPrice.toString();
    
    console.log(`  - 入力後の値: ${priceInput.value}`);
    
    // inputイベントを発火して値の変更を通知
    priceInput.dispatchEvent(new Event('input', { bubbles: true }));
    priceInput.dispatchEvent(new Event('change', { bubbles: true }));
    priceInput.dispatchEvent(new Event('blur', { bubbles: true }));
    
    console.log(`価格を ${newPrice}円 に設定しました (現在の値: ${priceInput.value})`);
    
    // 保存ボタンを探して押す
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 保存ボタンを探してクリック
    const saveButton = await waitForElement([
      'button:contains("出品する")',
      'button:contains("変更を保存")',
      'button:contains("保存")',
      'button:contains("更新")',
      'button[data-testid="save-button"]',
      'button[data-testid="update-button"]',
      'button[data-testid="submit-button"]',
      'button[type="submit"]',
      'form button:last-child',
      'button[class*="save"]',
      'button[class*="Save"]',
      'button[class*="update"]',
      'button[class*="Update"]',
      'button[class*="submit"]',
      'button[class*="Submit"]'
    ], 10000);
    
    if (saveButton) {
      console.log('保存ボタンを発見:', saveButton);
      
      // ボタンが有効か確認
      if (saveButton.disabled) {
        console.warn('⚠️ 保存ボタンが無効化されています');
        return { success: false, error: '保存ボタンが無効化されています' };
      }
      
      // フォームを事前に取得
      const form = priceInput.closest('form');
      console.log('📄 フォームを発見:', form);
      
      // ボタンをクリック
      console.log('💾 保存ボタンをクリック中...');
      
      // イベントリスナーでフォーム送信を監視
      let formSubmitted = false;
      if (form) {
        const submitHandler = () => {
          console.log('✅ フォーム送信が検出されました');
          formSubmitted = true;
        };
        form.addEventListener('submit', submitHandler, { once: true });
        
        // ボタンクリック
        saveButton.click();
        
        // フォーム送信を待機
        await new Promise(resolve => {
          const checkSubmit = () => {
            if (formSubmitted) {
              console.log('🎯 フォーム送信完了');
              resolve();
            } else {
              setTimeout(checkSubmit, 100);
            }
          };
          checkSubmit();
          // タイムアウト
          setTimeout(() => {
            if (!formSubmitted) {
              console.log('⏰ フォーム送信タイムアウト - 手動で送信を試行');
              try {
                if (form.isConnected) {
                  form.requestSubmit();
                } else {
                  console.log('⚠️ フォームがDOMから切断されています');
                }
              } catch (error) {
                console.log('⚠️ 手動送信エラー:', error.message);
              }
              resolve();
            }
          }, 2000);
        });
      } else {
        // フォームが見つからない場合は単純にクリック
        saveButton.click();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // 保存後の確認を待つ
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log('✅ 価格変更処理を完了しました');
      return { success: true, message: `価格を${newPrice}円に更新しました` };
    } else {
      console.warn('⚠️ 保存ボタンが見つかりません');
      return { success: false, error: '保存ボタンが見つかりません' };
    }
    
  } catch (error) {
    console.error('価格更新エラー:', error);
    return { success: false, error: error.message };
  }
}

// 要素を待機する関数
function waitForElement(selectors, timeout = 5000) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    function checkElement() {
      for (const selector of selectors) {
        let element;
        
        if (selector.includes(':contains(')) {
          // :contains() セレクターの処理
          const text = selector.match(/:contains\("([^"]+)"\)/)?.[1];
          if (text) {
            const buttons = document.querySelectorAll('button');
            element = Array.from(buttons).find(btn => 
              btn.textContent.includes(text)
            );
          }
        } else {
          element = document.querySelector(selector);
        }
        
        if (element) {
          console.log(`要素が見つかりました: ${selector}`);
          resolve(element);
          return;
        }
      }
      
      if (Date.now() - startTime < timeout) {
        setTimeout(checkElement, 100);
      } else {
        console.warn('要素が見つかりませんでした:', selectors);
        resolve(null);
      }
    }
    
    checkElement();
  });
}

// メッセージリスナー
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 メッセージを受信:', request);
  
  if (request.action === 'updatePrice') {
    console.log(`🔄 価格更新開始: 商品ID ${request.productId} を ${request.newPrice}円 に変更`);
    
    updateProductPrice(request.productId, request.newPrice)
      .then((result) => {
        console.log('✅ 価格更新成功:', result);
        
        // 成功時は3秒後にタブを閉じる（デバッグのため一時無効化）
        console.log('🔒 価格更新完了 - タブクローズは無効化中（デバッグモード）');
        // setTimeout(() => {
        //   console.log('🔒 価格更新完了 - タブを閉じます');
        //   chrome.runtime.sendMessage({ action: 'closeTab' });
        // }, 3000);
        
        sendResponse({ success: true, result: result });
      })
      .catch((error) => {
        console.error('❌ 価格更新失敗:', error);
        
        // エラー時は1秒後にタブを閉じる（デバッグのため一時無効化）
        console.log('❌ 価格更新エラー - タブクローズは無効化中（デバッグモード）');
        // setTimeout(() => {
        //   console.log('❌ 価格更新エラー - タブを閉じます');
        //   chrome.runtime.sendMessage({ action: 'closeTab' });
        // }, 1000);
        
        sendResponse({ success: false, error: error.message });
      });
    
    return true; // 非同期レスポンスを示す
  }
  
  sendResponse({ success: false, error: 'Unknown action' });
});

// ページ構造をデバッグする関数
function debugPageStructure() {
  console.log('=== ページ構造デバッグ ===');
  
  // 入力フィールドを探す
  const inputs = document.querySelectorAll('input');
  console.log(`入力フィールド数: ${inputs.length}`);
  inputs.forEach((input, index) => {
    console.log(`Input ${index + 1}:`, {
      type: input.type,
      name: input.name,
      placeholder: input.placeholder,
      'data-testid': input.getAttribute('data-testid'),
      className: input.className,
      value: input.value
    });
  });
  
  // ボタンを探す
  const buttons = document.querySelectorAll('button');
  console.log(`ボタン数: ${buttons.length}`);
  buttons.forEach((button, index) => {
    console.log(`Button ${index + 1}:`, {
      textContent: button.textContent.trim(),
      type: button.type,
      'data-testid': button.getAttribute('data-testid'),
      className: button.className,
      disabled: button.disabled
    });
  });
  
  console.log('=== デバッグ終了 ===');
}

// DOMが読み込まれたらデバッグ情報を出力
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM読み込み完了');
    debugPageStructure();
  });
} else {
  console.log('📄 DOMは既に読み込まれています');
  setTimeout(debugPageStructure, 1000); // 1秒待ってからデバッグ
}

console.log('🎉 価格編集スクリプトの初期化完了');
