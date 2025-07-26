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

// メルカリの出品商品情報を取得するスクリプト

// 新しいアプローチ:// メルカリページから商品情報を取得する改善された関数（非同期版）
async function getProductsFromMercariPage() {
  console.log('🔍 メルカリページから商品情報を取得中...');
  console.log('🌐 現在のURL:', window.location.href);
  console.log('📝 ページタイトル:', document.title);
  const products = [];
  
  // メルカリの最新DOM構造に対応したセレクター
  const selectors = [
    // メルカリ本物ページ用セレクター（最新版）
    'a[href*="/item/m"]', // 商品リンクの直接取得
    'div[data-testid="item-cell"] a[href*="/item/"]', // 商品セル内のリンク
    '[data-testid="item-cell"] a', // 商品セル内の任意のリンク
    'mer-item-thumbnail a', // サムネイルコンポーネント
    'mer-item-thumbnail a[href*="/item/"]', // サムネイル内の商品リンク
    // グリッドレイアウトの商品カード
    'section div > div > a[href*="/item/"]',
    'div[class*="grid"] a[href*="/item/"]',
    'div[class*="Grid"] a[href*="/item/"]',
    // 一般的な商品リンク
    'a[href*="/item/"]'
  ];
  
  let productLinks = [];
  
  // 各セレクターを試行
  for (const selector of selectors) {
    try {
      console.log(`🎯 セレクター "${selector}" を試行中...`);
      const links = document.querySelectorAll(selector);
      
      if (links.length > 0) {
        console.log(`✅ セレクター "${selector}" で ${links.length} 個の要素を発見`);
        productLinks = Array.from(links);
        break;
      }
    } catch (error) {
      console.log(`⚠️ セレクター "${selector}" でエラー: ${error.message}`);
    }
  }
  
  if (productLinks.length === 0) {
    console.log('⚠️ 商品リンクが見つかりません。ページ構造を調査中...');
    
    // ページ構造を調査
    console.log('🔍 ページ構造調査開始:');
    
    // 全てのリンクを調査
    const allLinks = document.querySelectorAll('a');
    console.log(`🔗 ページ内の全リンク数: ${allLinks.length}`);
    
    // 商品リンクらしきものを探す
    const possibleProductLinks = Array.from(allLinks).filter(link => 
      link.href && (link.href.includes('/item/') || link.href.includes('/product/') || link.href.includes('/goods/'))
    );
    console.log(`📎 商品リンクらしきもの: ${possibleProductLinks.length}件`);
    
    possibleProductLinks.slice(0, 5).forEach((link, index) => {
      console.log(`  ${index + 1}. ${link.href}`);
      console.log(`     テキスト: "${link.textContent?.trim().substring(0, 50)}..."`);
    });
    
    // 価格らしき要素を探す
    const priceElements = document.querySelectorAll('*');
    const possiblePrices = Array.from(priceElements).filter(el => {
      const text = el.textContent?.trim() || '';
      return /[¥￥]\s*[\d,]+/.test(text) && text.length < 20;
    });
    console.log(`💰 価格らしき要素: ${possiblePrices.length}件`);
    
    possiblePrices.slice(0, 5).forEach((el, index) => {
      console.log(`  ${index + 1}. タグ: ${el.tagName}, クラス: "${el.className}", テキスト: "${el.textContent?.trim()}"`);
    });
    
    return getProductInfoFlexible();
  }
  
  console.log(`📎 商品リンクを${productLinks.length}件発見しました`);
  
  // 最初の商品リンクの詳細を調査
  if (productLinks.length > 0) {
    const firstLink = productLinks[0];
    console.log('🔍 最初の商品リンク詳細:');
    console.log(`  URL: ${firstLink.href}`);
    console.log(`  テキスト: "${firstLink.textContent?.trim()}"`);
    console.log(`  クラス: "${firstLink.className}"`);
    console.log(`  親要素: ${firstLink.parentElement?.tagName} (class: "${firstLink.parentElement?.className}")`);
  }
  
  // 各商品リンクから情報を抽出
  for (let i = 0; i < productLinks.length; i++) {
    const linkElement = productLinks[i];
    console.log(`\n🔍 商品${i + 1}の情報抽出開始:`);
    const productInfo = await extractProductFromLink(linkElement, i);
    
    if (productInfo && productInfo.name && productInfo.price > 0) {
      products.push(productInfo);
      console.log(`✅ 商品${i + 1}: ${productInfo.name} - ¥${productInfo.price}`);
    } else {
      console.log(`❌ 商品${i + 1}: 情報取得失敗`);
      console.log(`  取得したデータ:`, productInfo);
    }
  }
  
  console.log(`🎉 ${products.length} 件の商品情報を取得しました`);
  return products;
}

// 商品リンクから情報を抽出（非同期版）
async function extractProductFromLink(linkElement, index) {
  console.log(`🔍 商品 ${index + 1} の情報を抽出中...`);
  
  if (!linkElement) {
    console.log('⚠️ リンク要素が無効');
    return null;
  }
  
  // URLを取得
  const url = linkElement.href;
  if (!url || (!url.includes('/item/') && !url.includes('/items/'))) {
    console.log('⚠️ 無効なURL:', url);
    return null;
  }
  
  // 商品IDを抽出（メルカリ本物とテストページの両方に対応）
  let productId;
  if (url.includes('/item/m')) {
    // メルカリ本物の商品IDパターン
    productId = url.match(/\/item\/(m\w+)/)?.[1];
  } else if (url.includes('/items/product_')) {
    // テストページの商品IDパターン
    productId = url.match(/\/items\/(product_\d+)/)?.[1];
  }
  
  if (!productId) {
    productId = `temp_${index + 1}`;
  }
  
  console.log(`🏷️ 商品ID: ${productId}`);
  console.log(`🔗 URL: ${url}`);
  
  // DOM要素から直接商品情報を取得（CORS制限を回避）
  let productName = '';
  let price = 0;
  
  console.log('🔍 DOM要素から商品情報を取得中...');
  const productInfo = getProductInfoFromElement(linkElement, url);
  if (productInfo) {
    productName = productInfo.name;
    price = productInfo.price;
    console.log(`✅ DOM要素から取得成功 - 商品名: ${productName}, 価格: ¥${price}`);
  }
  
  // DOM要素から取得できなかった場合、フォールバック方法で取得を試行
  if (!productName) {
    console.log('🔄 フォールバック方法で商品情報を取得中...');
    
    // フォールバック: リンクテキストから抽出
    const linkText = linkElement.textContent?.trim() || '';
    console.log(`🔍 リンクテキスト: "${linkText}"`);
    
    if (linkText) {
      // リンクテキストから商品名を抽出（優先度高）
      const extractedName = extractProductNameFromLinkText(linkText);
      if (extractedName) {
        productName = extractedName;
        console.log(`✅ リンクテキストから商品名抽出: ${productName}`);
      }
      
      // 価格もリンクテキストから抽出
      const extractedPrice = extractPriceFromText(linkText);
      if (extractedPrice > 0 && !price) {
        price = extractedPrice;
        console.log(`✅ リンクテキストから価格抽出: ${price}`);
      }
    }
    
    // 親要素から商品名を探す（商品名がまだない場合）
    if (!productName) {
      const parentElement = linkElement.closest('div, section, article') || linkElement.parentElement;
      if (parentElement) {
        const foundName = findProductNameInElement(parentElement);
        if (foundName) {
          productName = foundName;
          console.log(`✅ 親要素から商品名取得: ${productName}`);
        }
      }
    }
    
    // 親要素から価格を探す（価格がまだない場合）
    if (!price) {
      const parentElement = linkElement.closest('div, section, article') || linkElement.parentElement;
      if (parentElement) {
        const foundPrice = findPriceInElement(parentElement);
        if (foundPrice) {
          price = foundPrice;
          console.log(`✅ 親要素から価格取得: ${price}`);
        }
      }
    }
  }
  
  // フォールバック名を設定
  if (!productName) {
    productName = `商品_${index + 1}`;
    console.log(`⚠️ 商品名が見つからないため、フォールバック名を使用: ${productName}`);
  }
  
  console.log(`🏷️ 最終商品名: ${productName}`);
  console.log(`💰 価格: ¥${price}`);
  
  return {
    id: productId,
    name: productName,
    price: price,
    url: url,
    productId: productId
  };
}

// DOM要素から商品情報を取得する関数（CORS制限を回避）
function getProductInfoFromElement(element, url) {
  console.log(`🔍 DOM要素から商品情報を取得中: ${url}`);
  
  try {
    // 商品名を取得
    let productName = '';
    const nameSelectors = [
      '[data-testid="thumbnail-item-name"]',
      '[data-testid="item-name"]',
      'figcaption',
      '.item-name',
      '.item-title',
      'h3',
      'h2',
      'span[class*="name"]:not([class*="user"]):not([class*="shop"])',
      '[class*="ItemName"]',
      '[class*="itemName"]'
    ];
    
    for (const selector of nameSelectors) {
      const nameElement = element.querySelector(selector);
      if (nameElement && nameElement.textContent?.trim()) {
        productName = nameElement.textContent.trim();
        console.log(`✅ 商品名取得成功 (${selector}): ${productName}`);
        break;
      }
    }
    
    // セレクターで見つからない場合、リンクテキストから抽出
    if (!productName && element.textContent) {
      const linkText = element.textContent.trim();
      console.log(`🔍 リンクテキストから商品名を抽出中: ${linkText.substring(0, 100)}...`);
      
      // 価格や日付、ボタンテキストを除去して商品名を抽出
      let extractedName = linkText
        .replace(/¥[\d,]+/g, '') // 価格を除去
        .replace(/\d+日前に出品/g, '') // 日付を除去
        .replace(/編集する/g, '') // ボタンテキストを除去
        .replace(/\s+/g, ' ') // 連続するスペースを一つに
        .trim();
      
      // 最初の意味のある部分を抽出（最初の100文字まで）
      if (extractedName.length > 3) {
        productName = extractedName.substring(0, 100);
        console.log(`✅ リンクテキストから商品名抽出: ${productName}`);
      }
    }
    
    // 価格を取得
    let price = 0;
    const priceSelectors = [
      '[data-testid="price"]',
      '[data-testid="thumbnail-price"]',
      'mer-price',
      '[class*="Price"]',
      '[class*="price"]',
      'span[class*="Price"]',
      'span[class*="price"]'
    ];
    
    for (const selector of priceSelectors) {
      const priceElement = element.querySelector(selector);
      if (priceElement) {
        const priceText = priceElement.textContent?.trim() || '';
        const priceMatch = priceText.match(/[¥￥]?([\d,]+)/);
        if (priceMatch) {
          price = parseInt(priceMatch[1].replace(/,/g, ''));
          console.log(`💰 価格取得成功 (${selector}): ¥${price}`);
          break;
        }
      }
    }
    
    // フォールバック名を設定
    if (!productName) {
      productName = `商品_${Date.now()}`;
      console.log(`⚠️ 商品名が見つからないため、フォールバック名を使用: ${productName}`);
    }
    
    console.log(`🏷️ 最終商品名: ${productName}`);
    console.log(`💰 価格: ¥${price}`);
    
    return {
      name: productName,
      price: price
    };
    
  } catch (error) {
    console.error('❌ DOM要素からの商品情報取得エラー:', error);
    return {
      name: `商品_${Date.now()}`,
      price: 0
    };
  }
}

// 時間やステータス関連のテキストかどうかを判定
function isTimeOrStatusText(text) {
  const patterns = [
    /\d+時間前/,
    /\d+分前/,
    /\d+日前/,
    /更新/,
    /出品中/,
    /売り切れ/,
    /予約済/,
    /フォロー/,
    /いいね/,
    /コメント/,
    /^¥\d/,
    /^\s*$/
  ];
  
  return patterns.some(pattern => pattern.test(text));
}

// リンクテキストから商品名を抽出する関数
function extractProductNameFromLinkText(linkText) {
  if (!linkText || typeof linkText !== 'string') return '';
  
  // 価格、時間、ステータス情報を除去して商品名を抽出
  let cleanText = linkText
    // 価格情報を除去 (¥数字 または 数字円)
    .replace(/[¥￥]\d+([,\d]*)/g, '')
    .replace(/\d+円/g, '')
    // 時間情報を除去
    .replace(/\d+分前に更新/g, '')
    .replace(/\d+時間前に更新/g, '')
    .replace(/\d+日前に更新/g, '')
    // ステータス情報を除去
    .replace(/公開停止中/g, '')
    .replace(/売り切れ/g, '')
    .replace(/予約済/g, '')
    .replace(/出品中/g, '')
    // ボタンテキストを除去
    .replace(/編集する/g, '')
    .replace(/削除する/g, '')
    .replace(/詳細を見る/g, '')
    // 数字のみの部分を除去 (商品IDなど)
    .replace(/\b\d{8,}\b/g, '')
    // 余分な空白、改行、タブを整理
    .replace(/\s+/g, ' ')
    .trim();
  
  console.log(`🧩 クリーンアップ後: "${cleanText}"`);
  
  // 空文字や短すぎるテキストを除外
  if (!cleanText || cleanText.length < 3) {
    return '';
  }
  
  // 無効なパターンをチェック
  if (!isValidProductName(cleanText)) {
    return '';
  }
  
  // 最初の100文字で切り取り（長すぎる商品名を防ぐ）
  return cleanText.substring(0, 100);
}

// 注意: extractPriceFromText関数は下部で定義されています（数値を返すバージョン）

// 商品名が有効かどうかを検証する関数
function isValidProductName(text) {
  if (!text || typeof text !== 'string') return false;
  
  // 無効なパターンを除外
  const invalidPatterns = [
    /^CSVデータクリア$/i,
    /^データクリア$/i,
    /^クリア$/i,
    /^リセット$/i,
    /^削除$/i,
    /^ボタン$/i,
    /^button$/i,
    /^click$/i,
    /^クリック$/i,
    /^設定$/i,
    /^メニュー$/i,
    /^ナビゲーション$/i,
    /^ヘッダー$/i,
    /^フッター$/i,
    /^\d+円$/,
    /^[¥￥]\d/,
    /^ログイン$/i,
    /^ログアウト$/i
  ];
  
  for (const pattern of invalidPatterns) {
    if (pattern.test(text)) {
      console.log(`❌ 無効な商品名を除外: "${text}"`);
      return false;
    }
  }
  
  // 有効な商品名の条件
  if (text.length < 3 || text.length > 100) return false;
  
  return true;
}

// 要素内から商品名を探す
function findProductNameInElement(element) {
  const nameSelectors = [
    // メルカリ最新DOM構造対応
    '[data-testid*="name"]',
    '[data-testid*="title"]',
    'mer-item-name', // メルカリコンポーネント
    'mer-item-name span',
    'h1, h2, h3, h4',
    '[class*="ItemName"]', // キャメルケースクラス名
    '[class*="itemName"]',
    '[class*="title"]:not([class*="user"]):not([class*="shop"])',
    '[class*="name"]:not([class*="user"]):not([class*="shop"])',
    'span:not([class*="price"]):not([class*="time"]):not([class*="status"])',
    'div:not([class*="price"]):not([class*="time"]):not([class*="status"])'
  ];
  
  for (const selector of nameSelectors) {
    try {
      const nameElement = element.querySelector(selector);
      if (nameElement) {
        const text = nameElement.textContent?.trim();
        if (text && text.length > 3 && !isTimeOrStatusText(text)) {
          console.log(`🔍 セレクター "${selector}" でテキスト発見: "${text}"`);
          if (isValidProductName(text)) {
            console.log(`✅ セレクター "${selector}" で商品名取得: ${text}`);
            return text;
          } else {
            console.log(`❌ セレクター "${selector}" のテキストを無効と判定: "${text}"`);
          }
        }
      }
    } catch (error) {
      // セレクターエラーを無視
    }
  }
  
  // テキストノードから直接探す
  const allText = element.textContent || '';
  const lines = allText.split(/\n|\r/).map(line => line.trim()).filter(Boolean);
  
  for (const line of lines) {
    if (line.length > 3 && !isTimeOrStatusText(line) && !/^¥\d/.test(line)) {
      console.log(`🔍 テキストからライン発見: "${line}"`);
      if (isValidProductName(line)) {
        console.log(`✅ テキストから商品名取得: ${line}`);
        return line;
      } else {
        console.log(`❌ テキストラインを無効と判定: "${line}"`);
      }
    }
  }
  
  return '';
}

// 要素内から価格を探す
function findPriceInElement(element) {
  const priceSelectors = [
    // メルカリ最新DOM構造対応
    '[data-testid*="price"]',
    'mer-price', // メルカリ価格コンポーネント
    'mer-price span',
    '[class*="Price"]', // キャメルケースクラス名
    '[class*="price"]',
    'span[class*="Price"]',
    'div[class*="Price"]',
    'span:has-text("¥")',
    'div:has-text("¥")'
  ];
  
  for (const selector of priceSelectors) {
    try {
      const priceElement = element.querySelector(selector);
      if (priceElement) {
        const priceText = priceElement.textContent?.trim();
        const price = extractPriceFromText(priceText);
        if (price > 0) {
          console.log(`✅ セレクター "${selector}" で価格取得: ¥${price}`);
          return price;
        }
      }
    } catch (error) {
      // セレクターエラーを無視
    }
  }
  
  // テキストから価格を抽出
  const allText = element.textContent || '';
  return extractPriceFromText(allText);
}

// テキストから価格を抽出
function extractPriceFromText(text) {
  if (!text) return 0;
  
  const priceMatch = text.match(/¥\s?(\d{1,3}(?:,\d{3})*|\d+)/);
  if (priceMatch) {
    const priceStr = priceMatch[1].replace(/,/g, '');
    const price = parseInt(priceStr, 10);
    if (price >= 100 && price <= 999999) {
      return price;
    }
  }
  
  return 0;
}

// 方法1: DOM要素から直接取得
function getProductInfoFromDOM() {
  const products = [];
  
  // 出品中の商品一覧ページのセレクタ（実際のセレクタは変更される可能性があります）
  const productElements = document.querySelectorAll('[data-testid="item-cell"]');
  
  productElements.forEach(element => {
    try {
      // 商品名を取得
      const nameElement = element.querySelector('[data-testid="item-name"]') || 
                         element.querySelector('.item-name') ||
                         element.querySelector('h3') ||
                         element.querySelector('[title]');
      
      // 価格を取得  
      const priceElement = element.querySelector('[data-testid="item-price"]') ||
                          element.querySelector('.price') ||
                          element.querySelector('[class*="price"]');
      
      // URLを取得
      const linkElement = element.querySelector('a[href*="/items/"]') ||
                         element.querySelector('a');
      
      if (nameElement && priceElement && linkElement) {
        const product = {
          name: nameElement.textContent?.trim() || nameElement.getAttribute('title'),
          price: priceElement.textContent?.trim().replace(/[^\d]/g, ''),
          url: linkElement.href.startsWith('http') ? linkElement.href : `https://jp.mercari.com${linkElement.href}`,
          productId: linkElement.href.match(/\/items\/(\w+)/)?.[1]
        };
        
        if (product.name && product.price && product.url) {
          products.push(product);
        }
      }
    } catch (error) {
      console.warn('商品情報の取得でエラーが発生:', error);
    }
  });
  
  return products;
}

// 方法2: MutationObserverを使用して動的コンテンツに対応
function observeProductList() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        const products = getProductInfoFromDOM();
        if (products.length > 0) {
          console.log('取得した商品情報:', products);
          // ここで取得した情報を処理
          processProducts(products);
        }
      }
    });
  });
  
  // 商品リストのコンテナを監視
  const targetNode = document.querySelector('[data-testid="item-list"]') || 
                    document.querySelector('.item-list') ||
                    document.querySelector('main');
  
  if (targetNode) {
    observer.observe(targetNode, {
      childList: true,
      subtree: true
    });
  }
}

// 方法3: より柔軟なセレクタでの取得
function getProductInfoFlexible() {
  const products = [];
  
  // 複数のセレクタパターンを試す
  const selectors = [
    '[data-testid="item-cell"]',
    '.item-cell',
    '[class*="item"]',
    'article',
    '.product-item',
    'mer-item-thumbnail',
    'a[href*="/item/"]'
  ];
  
  let productElements = [];
  for (const selector of selectors) {
    productElements = document.querySelectorAll(selector);
    if (productElements.length > 0) {
      console.log(`✓ セレクター "${selector}" で${productElements.length}個の要素を発見`);
      break;
    }
  }
  
  productElements.forEach((element, index) => {
    const product = extractProductInfo(element, index);
    if (product) products.push(product);
  });
  
  return products;
}

function extractProductInfo(element, index) {
  // 商品名の取得パターン
  const nameSelectors = [
    'mer-item-thumbnail [data-testid="thumbnail-item-name"]', // メルカリの標準セレクター
    '[data-testid="thumbnail-item-name"]',
    '[data-testid="item-name"]',
    'mer-item-thumbnail figcaption',
    '.merItemThumbnail figcaption',
    'figcaption',
    '.item-name',
    '.item-title',
    'h3',
    'h2',
    'a[href*="/item/"] span', // リンク内のspan要素
    '[class*="name"]:not([class*="user"]):not([class*="shop"])', // ユーザー名やショップ名を除外
    '[class*="title"]:not([class*="user"]):not([class*="shop"])'
  ];
  
  // 価格の取得パターン
  const priceSelectors = [
    '[data-testid="item-price"]',
    '[data-testid="thumbnail-item-price"]',
    '.price',
    '[class*="price"]',
    '.cost',
    '.amount'
  ];
  
  // リンクの取得パターン
  const linkSelectors = [
    'a[href*="/items/"]',
    'a[href*="/item/"]',
    'a'
  ];
  
  let name = findBySelectors(element, nameSelectors);
  let price = findBySelectors(element, priceSelectors);
  let link = findBySelectors(element, linkSelectors);
  
  // Shadow DOM対応
  if (element.shadowRoot) {
    if (!name) name = findBySelectors(element.shadowRoot, nameSelectors);
    if (!price) price = findBySelectors(element.shadowRoot, priceSelectors);
    if (!link) link = findBySelectors(element.shadowRoot, linkSelectors);
  }
  
  // フォールバック: innerTextから解析
  if (!name || !price) {
    const text = element.innerText || element.textContent || '';
    const lines = text.split(/\n|\r|\t/).map(l => l.trim()).filter(Boolean);
    
    for (const line of lines) {
      // 価格行の検出
      const priceMatch = line.match(/[¥￥]?\s?(\d{1,3}(?:,\d{3})*|\d+)\s*円?/);
      if (priceMatch && !price) {
        const priceStr = priceMatch[1].replace(/,/g, '');
        const parsed = parseInt(priceStr, 10);
        if (parsed >= 100 && parsed <= 999999) {
          price = { textContent: parsed.toString() };
          continue;
        }
      }
      // 名前候補行（時間情報や不適切な文字列を除外）
      if (!name && line.length >= 5 && !/^[0-9,¥￥円\s]+$/.test(line)) {
        // 時間関連の文字列を除外
        const timePatterns = [
          /\d+時間前/, // "4時間前"
          /\d+分前/, // "30分前"
          /\d+日前/, // "2日前"
          /更新/, // "更新"
          /出品中/, // "出品中"
          /売り切れ/, // "売り切れ"
          /予約済/, // "予約済"
          /^\s*$/, // 空文字
          /^¥/, // 価格で始まる
          /フォロー/, // "フォロー"
          /いいね/, // "いいね"
          /コメント/ // "コメント"
        ];
        
        const isTimeRelated = timePatterns.some(pattern => pattern.test(line));
        if (!isTimeRelated) {
          name = { textContent: line };
        }
      }
    }
  }
  
  // URL取得
  if (!link && element.tagName === 'A') {
    link = element;
  } else if (!link && element.href) {
    link = { href: element.href };
  } else if (!link) {
    const hrefAttr = element.getAttribute('href');
    if (hrefAttr) {
      link = { href: hrefAttr };
    }
  }
  
  if (name && price && link) {
    const productName = name.textContent?.trim() || name.getAttribute?.('title') || `商品_${index + 1}`;
    const productPrice = parseInt(price.textContent?.trim().replace(/[^\d]/g, '') || '0', 10);
    const productUrl = link.href?.startsWith('http') ? link.href : 
                      link.href ? `https://jp.mercari.com${link.href}` : `#product_${index + 1}`;
    const productId = link.href?.match(/\/items?\/(\w+)/)?.[1] || `temp_${index + 1}`;
    
    return {
      id: productId, // ポップアップで使用される主キー
      name: productName,
      price: productPrice,
      url: productUrl,
      productId: productId // 従来のフィールドも保持
    };
  }
  
  return null;
}

function findBySelectors(parent, selectors) {
  for (const selector of selectors) {
    const element = parent.querySelector(selector);
    if (element) return element;
  }
  return null;
}

// 取得した商品情報を処理する関数
function processProducts(products) {
  products.forEach(product => {
    console.log(`商品名: ${product.name}`);
    console.log(`価格: ¥${product.price}`);
    console.log(`URL: ${product.url}`);
    console.log(`商品ID: ${product.productId}`);
    console.log('---');
  });
  
  // ここで自動値下げのロジックを実装
  // chrome.storage.localに保存したり、バックグラウンドスクリプトに送信など
}

// 方法4: ページの種類を判定して適切な取得方法を選択
function getProductsBasedOnPage() {
  const currentUrl = window.location.href;
  
  if (currentUrl.includes('/mypage/listings')) {
    // 出品中商品一覧ページ
    return getProductInfoFlexible();
  } else if (currentUrl.includes('/sell')) {
    // 出品ページ
    return getSingleProductInfo();
  } else {
    // その他のページ
    console.log('商品情報を取得できるページではありません');
    return getProductInfoFlexible(); // とりあえず試してみる
  }
}

function getSingleProductInfo() {
  // 単一商品の情報取得（編集ページなど）
  const nameInput = document.querySelector('input[name="name"]') || 
                   document.querySelector('[data-testid="product-name"]');
  const priceInput = document.querySelector('input[name="price"]') || 
                    document.querySelector('[data-testid="product-price"]');
  
  if (nameInput && priceInput) {
    return [{
      name: nameInput.value,
      price: parseInt(priceInput.value, 10),
      url: window.location.href,
      productId: window.location.href.match(/\/items?\/(\w+)/)?.[1] || 'current'
    }];
  }
  
  return [];
}

// ページから商品情報を取得する関数（非同期版）
async function getProductsFromPage() {
  console.log('🔍 商品スキャンを開始...');
  
  // ページ情報を詳細にログ出力
  console.log('🌐 ページ情報:');
  console.log(`URL: ${window.location.href}`);
  console.log(`タイトル: ${document.title}`);
  
  // 新しい改善されたメルカリ商品取得を優先的に使用
  console.log('📋 新しい商品取得ロジックを使用...');
  const products = await getProductsFromMercariPage();
  
  if (products && products.length > 0) {
    console.log(`✅ ${products.length} 件の商品を正常に取得`);
    return products;
  }
  
  console.log('⚠️ 新しいロジックで商品が見つからないため、フォールバック手法を試行...');
  return getProductInfoFlexible();
}

// デバッグ用: コンソールから手動実行できる関数をエクスポート
window.mercariScraper = {
  getProducts: getProductInfoFromDOM,
  getProductsFlexible: getProductInfoFlexible,
  getProductsFromMercariPage: getProductsFromMercariPage, // 新しい改善された関数
  startObserver: observeProductList,
  getProductsFromPage: getProductsFromPage,
  debugDOM: debugDOMStructure // DOMデバッグ関数
};

console.log('✅ メルカリ商品スキャナーが初期化されました');
console.log('手動実行: window.mercariScraper.getProductsFromPage()');

// 選択商品の価格調整処理
async function adjustPrices(data) {
  console.log('価格調整処理を開始:', data);
  
  let { products, reduction, minPrice } = data;
  // ガード: products が配列でない場合は空配列に
  if (!Array.isArray(products)) {
    console.warn('⚠️ products が未定義または配列でないため、空配列に置き換えます');
    products = [];
  }
  // 価格を数値に確実に変換
  products = products.map(p => ({
    ...p,
    price: typeof p.price === 'string' ? parseInt(String(p.price).replace(/[^\d]/g, ''), 10) : p.price
  }));
  
  // フォールバック: products が空の場合はページから再取得
  if (products.length === 0) {
    console.warn('⚠️ products が空。ページ DOM から再取得を試みます');
    try {
      products = await getProductsFromPage();
      console.log('DOM から再取得した products:', products);
    } catch (err) {
      console.error('DOM から products 再取得に失敗:', err);
    }
  }
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
      console.log(`💰 価格計算デバッグ:`);
      console.log(`  - 元の価格: ${product.price}円 (typeof: ${typeof product.price})`);
      console.log(`  - 値下げ額: ${reduction}円 (typeof: ${typeof reduction})`);
      
      const newPrice = product.price - reduction;
      console.log(`  - 新価格: ${newPrice}円 (typeof: ${typeof newPrice})`);
      
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
        
        console.log('⚙️ 実際の価格変更処理を開始...');
        
        try {
          // 商品編集ページのURLを構築
          const editUrl = `https://jp.mercari.com/sell/edit/${product.id}`;
          console.log('編集ページURL:', editUrl);
          
          // 新しいタブで編集ページを開く
          const editTab = await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('編集ページを開くタイムアウト'));
            }, 10000);
            
            chrome.runtime.sendMessage({
              action: 'openEditPage',
              url: editUrl,
              productId: product.id,
              newPrice: newPrice
            }, (response) => {
              clearTimeout(timeout);
              if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
              } else if (response && response.success) {
                resolve(response);
              } else {
                reject(new Error(response?.error || '編集ページを開けませんでした'));
              }
            });
          });
          
          if (editTab.success) {
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
            throw new Error(editTab.error || '価格変更に失敗しました');
          }
          
        } catch (error) {
          console.log('❌ 価格調整失敗:', error.message);
          results.push({
            id: product.id,
            name: product.name,
            success: false,
            message: `価格変更に失敗: ${error.message}`
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
          const products = await getProductsFromPage();
          console.log('取得した商品データ:', products);
          console.log('商品数:', products.length);
          
          // 各商品の詳細情報をログ出力
          products.forEach((product, index) => {
            console.log(`商品 ${index + 1}:`, {
              id: product.id,
              name: product.name,
              price: product.price,
              url: product.url,
              productId: product.productId
            });
          });
          
          sendResponse({ success: true, data: products });
          break;
          
        case 'adjustPrices':
          console.log('価格調整を開始...');
          const result = await adjustPrices({
            products: request.products || request.selectedProducts || [],
            reduction: typeof request.reduction === 'number' ? request.reduction : (request.reduction ? parseInt(request.reduction, 10) : 100),
            minPrice: typeof request.minPrice === 'number' ? request.minPrice : (request.minPrice ? parseInt(request.minPrice, 10) : 300)
          });
          sendResponse(result);
          break;
          
        case 'debugDOM':
          console.log('DOMデバッグ情報を取得...');
          const debugInfo = debugDOMStructure();
          sendResponse({ success: true, data: debugInfo });
          break;
          
        case 'updatePrice':
          console.log('価格更新処理は price-editor.js で処理されます');
          sendResponse({ success: false, error: 'このページでは価格更新はサポートされていません' });
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
