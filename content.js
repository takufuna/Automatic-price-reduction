// メルカリ価格調整ツール - コンテンツスクリプト（修正版）

console.log('メルカリ価格調整ツール - コンテンツスクリプトが読み込まれました');
console.log('現在のURL:', window.location.href);

// ページの読み込みを待機する関数
async function waitForPageLoad() {
  return new Promise((resolve) => {
    if (document.readyState === 'complete') {
      console.log('ページは既に読み込み完了です');
      resolve();
      return;
    }
    
    console.log('ページの読み込み完了を待機中...');
    
    const checkComplete = () => {
      if (document.readyState === 'complete') {
        console.log('ページの読み込みが完了しました');
        resolve();
      } else {
        setTimeout(checkComplete, 100);
      }
    };
    
    // イベントリスナーも設定
    window.addEventListener('load', () => {
      console.log('window.load イベントが発生しました');
      resolve();
    }, { once: true });
    
    // タイムアウトも設定（5秒後）
    setTimeout(() => {
      console.log('ページ読み込み待機がタイムアウトしました');
      resolve();
    }, 5000);
    
    checkComplete();
  });
}

// DOM構造をデバッグする関数（大幅強化版）
function debugDOMStructure() {
  console.log('\n=== 🔍 メルカリDOM構造詳細分析 ===');
  console.log('現在のURL:', window.location.href);
  console.log('ページタイトル:', document.title);
  console.log('body要素のクラス:', document.body.className);
  
  // 1. data-testid属性を持つ要素を検索
  const testIdElements = document.querySelectorAll('[data-testid]');
  console.log(`\n📋 data-testid属性を持つ要素数: ${testIdElements.length}`);
  
  if (testIdElements.length > 0) {
    console.log('🏷️  data-testid値の一覧:');
    const testIds = Array.from(testIdElements).map(el => el.getAttribute('data-testid')).filter(id => id);
    const uniqueTestIds = [...new Set(testIds)];
    uniqueTestIds.forEach(id => {
      const count = testIds.filter(tid => tid === id).length;
      console.log(`  - ${id} (${count}個)`);
    });
  }
  
  // 2. メルカリ関連のクラス名を検索
  const allElements = document.querySelectorAll('*');
  const mercariClasses = new Set();
  const itemRelatedClasses = new Set();
  
  allElements.forEach(el => {
    if (el.className && typeof el.className === 'string') {
      const classes = el.className.split(' ');
      classes.forEach(cls => {
        if (cls.toLowerCase().includes('item') || 
            cls.toLowerCase().includes('listing') || 
            cls.toLowerCase().includes('product') ||
            cls.toLowerCase().includes('card') ||
            cls.toLowerCase().includes('mer')) {
          mercariClasses.add(cls);
        }
        if (cls.toLowerCase().includes('item')) {
          itemRelatedClasses.add(cls);
        }
      });
    }
  });
  
  console.log('\n🎨 メルカリ関連のクラス名 (上位20個):');
  Array.from(mercariClasses).slice(0, 20).forEach(cls => {
    const count = document.querySelectorAll(`.${cls}`).length;
    console.log(`  - ${cls} (${count}個)`);
  });
  
  console.log('\n📦 "item"関連のクラス名:');
  Array.from(itemRelatedClasses).slice(0, 15).forEach(cls => {
    const count = document.querySelectorAll(`.${cls}`).length;
    console.log(`  - ${cls} (${count}個)`);
  });
  
  // 3. 画像要素の分析
  const images = document.querySelectorAll('img');
  console.log(`\n🖼️  画像要素数: ${images.length}`);
  
  const productImages = Array.from(images).filter(img => 
    img.src.includes('mercari') || 
    img.alt.includes('商品') ||
    img.className.includes('item') ||
    img.className.includes('product')
  );
  console.log(`📸 商品画像と思われる要素数: ${productImages.length}`);
  
  // 4. リンク要素の分析
  const allLinks = document.querySelectorAll('a');
  const itemLinks = document.querySelectorAll('a[href*="items"]');
  console.log(`\n🔗 全リンク要素数: ${allLinks.length}`);
  console.log(`🛍️  商品リンク要素数: ${itemLinks.length}`);
  
  if (itemLinks.length > 0) {
    console.log('\n🔍 商品リンクの詳細分析:');
    Array.from(itemLinks).slice(0, 5).forEach((link, index) => {
      console.log(`  ${index + 1}. URL: ${link.href}`);
      console.log(`     クラス: "${link.className}"`);
      console.log(`     data-testid: "${link.getAttribute('data-testid') || 'なし'}"`);
      console.log(`     親要素: ${link.parentElement?.tagName} ("${link.parentElement?.className}")`);
      console.log(`     テキスト: "${link.textContent?.substring(0, 50)}..."`);
      console.log(`     ---`);
    });
  }
  
  // 5. 価格要素の分析
  const priceElements = document.querySelectorAll('*');
  const priceTexts = [];
  priceElements.forEach(el => {
    const text = el.textContent || '';
    if (text.match(/¥[\d,]+|[\d,]+円/)) {
      priceTexts.push({
        text: text.substring(0, 50),
        className: el.className,
        tagName: el.tagName
      });
    }
  });
  
  console.log(`\n💰 価格らしきテキストを含む要素数: ${priceTexts.length}`);
  priceTexts.slice(0, 10).forEach((price, index) => {
    console.log(`  ${index + 1}. "${price.text}" (${price.tagName}.${price.className})`);
  });
  
  // 6. メインコンテンツエリアの特定
  const mainElements = document.querySelectorAll('main, [role="main"], .main-content, #main');
  console.log(`\n🏠 メインコンテンツエリア数: ${mainElements.length}`);
  mainElements.forEach((main, index) => {
    console.log(`  ${index + 1}. ${main.tagName} ("${main.className}")`);
    const childDivs = main.querySelectorAll('div');
    console.log(`     子div要素数: ${childDivs.length}`);
  });
  
  // 7. 実際に商品らしい要素を探す
  console.log('\n🎯 商品要素候補の検索:');
  const candidateSelectors = [
    'a[href*="items"]',
    '[data-testid*="item"]',
    '[class*="item"][class*="card"]',
    'div:has(img)',
    'section div',
  ];
  
  candidateSelectors.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      console.log(`  "${selector}": ${elements.length}個`);
    } catch (e) {
      console.log(`  "${selector}": エラー - ${e.message}`);
    }
  });
  
  console.log('=== DOM分析完了 ===\n');
}

// メッセージリスナーを設定
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  console.log('メッセージを受信:', request);
  
  if (request.action === 'scanProducts') {
    try {
      const result = await scanProducts();
      sendResponse({ success: true, data: result });
    } catch (error) {
      console.error('スキャンエラー:', error);
      sendResponse({ success: false, error: error.message });
    }
    return true; // 非同期レスポンスを示す
  } else if (request.action === 'adjustPrices') {
    try {
      const result = await adjustPrices(request.products);
      sendResponse({ success: true, data: result });
    } catch (error) {
      console.error('価格調整エラー:', error);
      sendResponse({ success: false, error: error.message });
    }
    return true;
  }
});

// 商品情報をスキャン
async function scanProducts() {
  try {
    console.log('=== 商品スキャン開始 ===');
    console.log('現在のURL:', window.location.href);
    console.log('ページタイトル:', document.title);
    console.log('ページ状態:', document.readyState);
    
    // ページの読み込みを待機
    await waitForPageLoad();
    
    // DOM構造をデバッグ
    debugDOMStructure();
    
    // メルカリの出品一覧ページかどうかをチェック
    const isMercariListingPage = window.location.href.includes('mercari.com') && 
                                (window.location.href.includes('/mypage/listings') || 
                                 window.location.href.includes('/sell') ||
                                 window.location.href.includes('/mypage'));
    
    if (!isMercariListingPage) {
      console.warn('メルカリの出品一覧ページではありません');
      return [];
    }
    
    // 商品要素を取得
    const products = await getProductsFromPage();
    
    console.log(`=== スキャン完了: ${products.length}件の商品を検出 ===`);
    return products;
    
  } catch (error) {
    console.error('商品スキャン中にエラーが発生:', error);
    throw error;
  }
}

// ページから商品情報を取得する関数
function getProductsFromPage() {
  console.log('🔍 商品スキャンを開始...');
  
  // ページ情報を詳細にログ出力
  console.log('🌐 ページ情報:');
  console.log(`URL: ${window.location.href}`);
  console.log(`タイトル: ${document.title}`);
  console.log(`ホスト: ${window.location.hostname}`);
  console.log(`パス: ${window.location.pathname}`);
  
  // DOMの基本情報
  console.log('🏠 DOM情報:');
  console.log(`全要素数: ${document.querySelectorAll('*').length}`);
  console.log(`リンク数: ${document.querySelectorAll('a').length}`);
  console.log(`画像数: ${document.querySelectorAll('img').length}`);
  console.log(`テストID要素数: ${document.querySelectorAll('[data-testid]').length}`);
  
  const products = [];

  // ============================
  // 第一優先: <mer-item-thumbnail> から商品を抽出
  // ============================
  const thumbnailEls = document.querySelectorAll('mer-item-thumbnail');
  if (thumbnailEls.length > 0) {
    console.log(`✓ mer-item-thumbnail 要素を ${thumbnailEls.length} 個検出`);
    thumbnailEls.forEach((el, index) => {
      try {
        // URL 取得
        let url = '';
        if (el.href) {
          url = el.href;
        } else {
          const hrefAttr = el.getAttribute('href');
          if (hrefAttr) {
            url = hrefAttr.startsWith('http') ? hrefAttr : location.origin + hrefAttr;
          }
        }

        // Shadow DOM 内を探索
        const shadow = el.shadowRoot;
        let name = '';
        let price = 0;
        if (shadow) {
          const nameEl = shadow.querySelector('[data-testid="thumbnail-item-name"], figcaption, h3');
          if (nameEl && nameEl.textContent.trim()) {
            name = nameEl.textContent.trim();
          }
          const priceEl = shadow.querySelector('[data-testid="thumbnail-item-price"], [class*="price"], span');
          if (priceEl && priceEl.textContent.trim()) {
            const m = priceEl.textContent.trim().match(/[¥￥]?\s*(\d{1,3}(?:,\d{3})*|\d+)\s*円?/);
            if (m) {
              price = parseInt(m[1].replace(/,/g, ''), 10);
            }
          }
        }

        // フォールバック: innerText から解析
        const text = el.innerText || '';
        if (!name && text) {
          const firstLine = text.split('\n').map(t => t.trim()).filter(Boolean)[0];
          if (firstLine) name = firstLine;
        }
        if (!price && text) {
          const m = text.match(/[¥￥]?\s*(\d{1,3}(?:,\d{3})*|\d+)\s*円?/);
          if (m) price = parseInt(m[1].replace(/,/g, ''), 10);
        }
        if (!name) name = `商品_${index + 1}`;

        const idMatch = url.match(/item\/(\w+)/);
        const productId = idMatch ? idMatch[1] : `temp_${index + 1}`;

        products.push({ name, price, url, productId });
        console.log(`✓ 商品 ${index + 1}: ${name} - ${price}円 (${url})`);
      } catch (err) {
        console.error('mer-item-thumbnail 解析エラー:', err);
      }
    });

    console.log(`✓ mer-item-thumbnail から ${products.length} 件の商品情報を取得`);
    return products;
  }

  
  // 複数のセレクターを試して商品要素を取得（優先度順）
  const selectors = [
    // テストページ用（優先度高）
    '.item-box',
    '[data-testid="item-cell"]',
    
    // メルカリ最新セレクター
    'mer-item-thumbnail',
    'mer-item-object',
    '[data-testid*="item-"]',
    'a[href*="/items/m"]',
    '[class*="ItemCell"]',
    '[class*="itemCell"]',
    '[class*="ItemThumbnail"]',
    '[class*="itemThumbnail"]',
    '[class*="ItemObject"]',
    '[class*="itemObject"]',
    '[class*="Item_"]',
    '[class*="item_"]',
    '[class*="Item-"]',
    '[class*="item-"]',
    '[class*="listing"]',
    '[class*="product"]',
    '[class*="card"]',
    '[class*="Card"]',
    
    // メルカリの構造的セレクター
    'section[class*="item"] > div',
    'section[class*="Item"] > div',
    'div[class*="grid"] > div',
    'div[class*="Grid"] > div',
    'div[class*="list"] > div',
    'div[class*="List"] > div',
    'ul > li',
    'ol > li',
    
    // 画像を含む要素（低優先度）
    'div:has(img[alt*="商品"])',
    'div:has(img[src*="item"])',
    'div:has(img[src*="product"])',
    'div:has(img[src*="mercari"])',
    'a:has(img)',
    
    // 一般的なセレクター（低優先度）
    'article',
    'section > div',
    'main div',
    'div[role="listitem"]',
    '[role="gridcell"]',
    
    // 最後の手段：すべてのリンク
    'a[href]'
  ];
  
  let productElements = [];
  
  console.log('\n🔍 商品要素の検索開始...');
  
  // 各セレクターで要素を探して結果をログ出力
  for (const selector of selectors) {
    try {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        console.log(`✓ ${selector}: ${elements.length}個の要素を発見`);
        
        // 最初の要素の詳細を表示
        if (elements.length > 0) {
          const firstEl = elements[0];
          console.log(`  - 最初の要素: ${firstEl.tagName}, クラス: "${firstEl.className}", ID: "${firstEl.id}"`);
          console.log(`  - テキストサンプル: "${(firstEl.textContent || '').substring(0, 100)}..."`);
          console.log(`  - HTMLサンプル: "${firstEl.outerHTML.substring(0, 200)}..."`);
        }
        
        
        productElements = Array.from(elements);
        console.log(`✓ セレクター "${selector}" で${elements.length}個の要素を発見`);
        break; // 最初に見つかったセレクターを使用
      }
    } catch (error) {
      console.warn(`セレクター "${selector}" でエラー:`, error);
    }
  }
  
  if (productElements.length === 0) {
    console.warn('❌ 商品要素が見つかりませんでした');
    return [];
  }
  
  console.log(`📦 ${productElements.length}個の要素を処理中...`);
  
  productElements.forEach((element, index) => {
    try {
      console.log(`\n--- 商品 ${index + 1} の処理 ---`);
      
      // デバッグ: 要素の構造を調査
      console.log('🔍 要素の構造調査:');
      console.log('tagName:', element.tagName);
      console.log('className:', element.className);
      console.log('id:', element.id);
      console.log('innerHTML (first 200 chars):', element.innerHTML.substring(0, 200));
      console.log('textContent (first 100 chars):', element.textContent?.substring(0, 100));
      
      // 子要素の一覧を表示
      const childElements = element.querySelectorAll('*');
      console.log(`子要素数: ${childElements.length}`);
      
      // 主要な子要素のタグとクラスを表示
      const elementInfo = [];
      for (let i = 0; i < Math.min(10, childElements.length); i++) {
        const child = childElements[i];
        elementInfo.push(`${child.tagName}.${child.className || 'no-class'}`);
      }
      console.log('主要な子要素:', elementInfo.join(', '));
      
      // 商品名を取得（メルカリ実際ページ対応）
      let name = '';
      const nameSelectors = [
        '.item-name',                    // テストページ用
        '[data-testid="item-name"]',     // テストページ用
        'mer-item-thumbnail figcaption', // メルカリ実際ページ
        'mer-item-thumbnail [data-testid="thumbnail-item-name"]', // メルカリ
        '.merItemThumbnail figcaption',  // メルカリ旧バージョン
        'figcaption',                    // 一般的なfigcaption
        'h3',                            // タイトル要素
        '.item-title',                   // 一般的なタイトル
        '[class*="name"]',               // nameを含むクラス
        '[class*="title"]'               // titleを含むクラス
      ];
      
      console.log('\n🔍 商品名検索開始:');
      for (const selector of nameSelectors) {
        console.log(`セレクターテスト: ${selector}`);
        const nameEl = element.querySelector(selector);
        if (nameEl) {
          console.log(`  ✓ 要素発見: ${nameEl.tagName}.${nameEl.className}`);
          console.log(`  textContent: "${nameEl.textContent?.trim() || 'empty'}"`);
          if (nameEl.textContent?.trim()) {
            name = nameEl.textContent.trim();
            console.log(`✓ 商品名取得 (${selector}): ${name}`);
            break;
          }
        } else {
          console.log(`  ✗ 要素が見つかりません`);
        }
      }
      
      if (!name) {
        name = `商品_${index + 1}`; // フォールバック名
        console.log(`⚠️ 商品名が見つからないため、フォールバック名を使用: ${name}`);
      }

      // 価格を取得（メルカリ実際ページ対応）
      let price = 0;
      const priceSelectors = [
        '.item-price',                   // テストページ用
        '[data-testid="item-price"]',    // テストページ用
        'mer-item-thumbnail [data-testid="thumbnail-item-price"]', // メルカリ
        '.merItemThumbnail [data-testid="thumbnail-item-price"]',  // メルカリ旧バージョン
        '[class*="price"]',              // priceを含むクラス
        'span[data-testid="price"]',     // priceを含むdata-testid
        'span[data-testid="item-price"]' // item-priceを含むdata-testid
      ];
      
      console.log('\n🔍 価格検索開始:');
      for (const selector of priceSelectors) {
        console.log(`セレクターテスト: ${selector}`);
        const priceEl = element.querySelector(selector);
        if (priceEl) {
          console.log(`  ✓ 要素発見: ${priceEl.tagName}.${priceEl.className}`);
          const priceText = priceEl.textContent?.trim() || '';
          console.log(`  textContent: "${priceText}"`);
          if (priceText) {
            console.log(`価格テキスト (${selector}): "${priceText}"`);
            const priceMatch = priceText.match(/[¥￥]?\s*(\d{1,3}(?:,\d{3})*|\d+)\s*円?/) || priceText.match(/(\d+)/);
            if (priceMatch) {
              const priceStr = priceMatch[1].replace(/,/g, '');
              const parsedPrice = parseInt(priceStr, 10);
              console.log(`  パース結果: ${parsedPrice}`);
              if (parsedPrice >= 100 && parsedPrice <= 999999) {
                price = parsedPrice;
                console.log(`✓ 価格取得 (${selector}): ${price}円`);
                break;
              } else {
                console.log(`  ✗ 価格が範囲外: ${parsedPrice}`);
              }
            } else {
              console.log(`  ✗ 価格パターンマッチせず`);
            }
          }
        } else {
          console.log(`  ✗ 要素が見つかりません`);
        }
      }
      
      if (price === 0) {
        console.log('⚠️ 価格が見つかりません');
      }


      
      // URLを取得（テストページ用に簡素化）
      let url = '';
      const linkEl = element.tagName === 'A' ? element : element.querySelector('a');
      if (linkEl && linkEl.href) {
        url = linkEl.href;
        console.log(`✓ URL取得: ${url}`);
      } else {
        url = `#product_${index + 1}`; // フォールバックURL
        console.log(`⚠️ URLが見つからないため、フォールバックURLを使用: ${url}`);
      }

      // 商品IDを抽出（簡素化）
      let productId = '';
      if (url && url.includes('product_')) {
        const idMatch = url.match(/product_(\d+)/);
        if (idMatch) {
          productId = `product_${idMatch[1]}`;
          console.log(`✓ 商品ID取得: ${productId}`);
        }
      } else {
        productId = `temp_${index + 1}`; // 一時ID
        console.log(`⚠️ 商品IDが見つからないため、一時IDを使用: ${productId}`);
      }

      // 商品情報を登録（簡素化）
      const product = {
        name: name,
        price: price,
        url: url,
        productId: productId
      };
      
      products.push(product);
      console.log(`✓ 商品登録: ${name} - ${price}円`);
      console.log(`  URL: ${url}`);
      console.log(`  ID: ${productId}`);
      console.log('---');
      
    } catch (e) {
      console.error(`商品 ${index + 1} の処理中にエラー:`, e);
    }
  });
  
  console.log(`✓ 合計 ${products.length} 個の商品を検出しました`);
  return products;
}

// 選択商品の価格調整処理
async function adjustPrices(data) {
  console.log('価格調整処理を開始:', data);
  
  const { products, reduction, minPrice } = data;
  const results = [];
  
  try {
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(`\n--- 商品 ${i + 1}/${products.length} の価格調整 ---`);
      console.log(`商品名: ${product.name}`);
      console.log(`現在価格: ${product.price}円`);
      console.log(`値下げ額: ${reduction}円`);
      console.log(`最低価格: ${minPrice}円`);
      
      // 新しい価格を計算
      const newPrice = product.price - reduction;
      
      if (newPrice < minPrice) {
        console.log(`⚠️ 新価格(${newPrice}円)が最低価格(${minPrice}円)を下回るためスキップ`);
        results.push({
          id: product.id,
          name: product.name,
          success: false,
          message: `最低価格以下のためスキップ (新価格: ${newPrice}円)`
        });
        continue;
      }
      
      console.log(`新価格: ${newPrice}円`);
      
      // 実際の価格変更処理をシミュレート
      try {
        // ここで実際にはメルカリの編集ページに移動して価格を変更する
        // 現在はデモ版のため、シミュレートのみ
        
        console.log('⚙️ 価格変更処理をシミュレート中...');
        
        // ランダムな遅延でリアルな処理をシミュレート
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        // 90%の確率で成功とする（デモ用）
        const isSuccess = Math.random() > 0.1;
        
        if (isSuccess) {
          console.log('✅ 価格調整成功');
          results.push({
            id: product.id,
            name: product.name,
            oldPrice: product.price,
            newPrice: newPrice,
            success: true,
            message: `${product.price}円 → ${newPrice}円 (−${reduction}円)`
          });
        } else {
          console.log('❌ 価格調整失敗');
          results.push({
            id: product.id,
            name: product.name,
            success: false,
            message: '価格変更に失敗しました'
          });
        }
        
      } catch (error) {
        console.error(`商品 ${product.name} の価格調整中にエラー:`, error);
        results.push({
          id: product.id,
          name: product.name,
          success: false,
          message: `エラー: ${error.message}`
        });
      }
      
      // レート制限のための間隔
      if (i < products.length - 1) {
        console.log('⏳ レート制限のため 2 秒待機...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    console.log(`\n🎉 価格調整完了: 成功 ${successCount}件、失敗 ${failCount}件`);
    
    return {
      success: true,
      results: results,
      summary: {
        total: products.length,
        success: successCount,
        failed: failCount
      }
    };
    
  } catch (error) {
    console.error('価格調整処理でエラー:', error);
    return {
      success: false,
      error: error.message,
      results: results
    };
  }
}

// メッセージリスナー
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('メッセージを受信:', request);
  
  // 非同期処理のためにtrueを返す
  (async () => {
    try {
      switch (request.action) {
        case 'scanProducts':
          console.log('商品スキャンを開始...');
          const products = await scanProducts();
          sendResponse({ success: true, data: products });
          break;
          
        case 'adjustPrices':
          console.log('価格調整を開始...');
          const result = await adjustPrices({
            products: request.products,
            reduction: request.reduction,
            minPrice: request.minPrice
          });
          sendResponse(result);
          break;
          
        case 'debugDOM':
          console.log('DOMデバッグ情報を取得...');
          const debugInfo = debugDOMStructure();
          sendResponse({ success: true, data: debugInfo });
          break;
          
        default:
          console.log('未知のアクション:', request.action);
          sendResponse({ success: false, error: '未知のアクション' });
      }
    } catch (error) {
      console.error('メッセージ処理エラー:', error);
      sendResponse({ success: false, error: error.message });
    }
  })();
  
  return true; // 非同期レスポンスを示す
});

console.log('コンテンツスクリプトの初期化完了');
