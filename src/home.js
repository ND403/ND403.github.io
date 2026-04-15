/////////////////////////////////////////
/// top動画制御
/////////////////////////////////////////
const playlist = [
    { src: '../video/gravity_run_temp1.mp4', img: '../images/gravity_run_logo.png', title: 'Gravity Run' },
    { src: '../video/code_loader_temp2.mp4', img: '../images/code_loader_logo.png', title: 'CODE:LOADER' },
    { src: '../video/mogusa_park_temp3.mp4', img: '../images/temp.png', title: '百草Park' }
];

let currentIndex = 0;
const video = document.getElementById('main-video');
const titleImg = document.getElementById('video-title-img');
const indexContainer = document.getElementById('side-index');
const progressInner = document.getElementById('progress-inner');


function init() {
    playlist.forEach((item, index) => {
        const bar = document.createElement('div');
        bar.classList.add('index-item');
        
        // 修正：imgではなくspan（テキスト）を作成
        const titleText = document.createElement('span');
        titleText.textContent = item.title;
        titleText.classList.add('index-item-title');
        
        bar.appendChild(titleText);
        bar.addEventListener('click', () => updateGallery(index));
        indexContainer.appendChild(bar);
    });
    updateGallery(0);
}

function updateGallery(index) {
    currentIndex = index;
    const data = playlist[currentIndex];

    // ロゴのフェード切り替え
    titleImg.style.opacity = 0;
    setTimeout(() => {
        titleImg.src = data.img;
        titleImg.style.opacity = 1;
    }, 400);

    // インデックスのアクティブ切り替え
    const items = document.querySelectorAll('.index-item');
    items.forEach((item, i) => {
        item.classList.toggle('active', i === currentIndex);
    });

    // 動画再生
    video.src = data.src;
    video.load();
    video.play().catch(e => console.log("Play blocked"));
}

video.addEventListener('timeupdate', () => {
    if (video.duration) {
        const percent = (video.currentTime / video.duration) * 100;
        progressInner.style.width = percent + '%';
    }
});

video.addEventListener('ended', () => {
    updateGallery((currentIndex + 1) % playlist.length);
});



/////////////////////////////////////////
/// アニメーション制御
/////////////////////////////////////////
/**
 * スクロール監視アニメーション・マネージャー
 */
const scrollAnimConfig = {
    decrypt: {
        fps: 12,
        duration:400,
        maxNoise: 3,
        chars: '01<>-_\\/[]{}—=+*^?#&$'
    },
    typing: {
        speed: 25
    }
};


// --- アニメーションロジック群 ---

function getNoise(len) {
    let res = '';
    for (let i = 0; i < len; i++) {
        res += scrollAnimConfig.decrypt.chars[Math.floor(Math.random() * scrollAnimConfig.decrypt.chars.length)];
    }
    return res;
}

/**
 * 1. デクリプト（解析）実行
 */
function animateDecrypt(el) {
    if (el.dataset.animId) cancelAnimationFrame(el.dataset.animId);
    
    // datasetから取る。もしリセット等で消えていても、初期化時に保存したものが生きている
    const finalText = el.dataset.originText;
    
    // 万が一データが取れなかった時のための安全装置
    if (!finalText) return;

    el.textContent = '';
    el.classList.add('is-visible', 'typing-cursor');

    const startTime = performance.now();
    let lastNoiseTime = 0;
    let currentNoise = '';

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / scrollAnimConfig.decrypt.duration, 1);
        const confirmedIndex = Math.floor(finalText.length * progress);

        if (progress < 1) {
            // ノイズの更新
            if (currentTime - lastNoiseTime > (1000 / scrollAnimConfig.decrypt.fps)) {
                currentNoise = '';
                for(let i=0; i<scrollAnimConfig.decrypt.maxNoise; i++) {
                    currentNoise += scrollAnimConfig.decrypt.chars[Math.floor(Math.random() * scrollAnimConfig.decrypt.chars.length)];
                }
                lastNoiseTime = currentTime;
            }
            
            // 確定文字 + ノイズ
            el.textContent = finalText.substring(0, confirmedIndex) + currentNoise;
            el.dataset.animId = requestAnimationFrame(update);
        } else {
            // ★完了時は確実に原文をセット
            el.textContent = finalText;
            el.classList.remove('typing-cursor');
            delete el.dataset.animId;
        }
    }
    el.dataset.animId = requestAnimationFrame(update);
}


/**
 * 2. タイピング（spanクラス付与）実行
 */
function animateTyping(container) {
    const spans = container.querySelectorAll('span');
    let i = 0;
    
    function next() {
        if (i < spans.length) {
            spans[i].classList.add('typed');
            i++;
            container.dataset.timer = setTimeout(next, scrollAnimConfig.typing.speed);
        } else {
            const cursor = container.querySelector('.cursor');
            if (cursor) cursor.classList.add('active');
        }
    }
    next();
}




/////////////////////////////////////////
/// 汎用制御
/////////////////////////////////////////

// --- 3. 共通のリセット処理 ---
function resetElement(el) {
    if (el.classList.contains('js-decrypt')) {
        if (el.dataset.animId) cancelAnimationFrame(el.dataset.animId);
        el.classList.remove('is-visible', 'typing-cursor');
        
        // ★重要：画面外に出た時、次に備えて空にしておくが、
        // visibility: hidden なので、チラつきは発生しません。
        el.textContent = ''; 
    } else if (el.id === 'typing-target') {
        clearTimeout(el.dataset.timer);
        el.querySelectorAll('span').forEach(s => s.classList.remove('typed'));
        const cursor = document.querySelector('.cursor');
        if (cursor) cursor.classList.remove('active');
    }
}


// --- 4. IntersectionObserver（監視マネージャー） ---
const scrollManager = {
    targets: [],
    
    init() {
        // 監視対象をリストアップ
        const decryptElements = document.querySelectorAll('.js-decrypt');
        const typingTarget = document.getElementById('typing-target');

        decryptElements.forEach(el => {
            // 初期化時にバックアップを強制（画面外リロード対策）
            const text = el.textContent.trim();
            if (text !== "") el.dataset.originText = text;
            this.targets.push({ el, type: 'decrypt', active: false });
        });

        if (typingTarget) {
            this.targets.push({ el: typingTarget, type: 'typing', active: false });
        }

        // スクロールイベントを監視
        window.addEventListener('scroll', () => this.checkScroll());
        // 初回ロード時もチェック
        this.checkScroll();
    },

    checkScroll() {
        const vh = window.innerHeight;
        const playBoundaryTop = vh * (0.15); // 画面上から35%の位置
        const playBoundaryBottom = vh * (0.85); // 画面上から65%の位置
        
        // 完全に消去する余裕（オフセット: 100px分画面外に出たらリセット）
        const resetOffset = 100;

        this.targets.forEach(item => {
            const rect = item.el.getBoundingClientRect();
            const itemCenter = rect.top + rect.height / 2;

            // 再生判定：要素の中心が画面の35%〜65%の範囲に入ったか
            const isInsidePlayRange = itemCenter > playBoundaryTop && itemCenter < playBoundaryBottom;
            
            // 消失判定：要素が画面外（上下にresetOffset分）へ完全に出たか
            const isCompletelyOutside = rect.bottom < -resetOffset || rect.top > vh + resetOffset;

            if (isInsidePlayRange && !item.active) {
                // 範囲内に入り、かつ未再生なら実行
                item.active = true;
                if (item.type === 'decrypt') {
                    animateDecrypt(item.el);
                } else {
                    resetElement(item.el); // 一度クリア
                    animateTyping(item.el);
                }
            } else if (isCompletelyOutside && item.active) {
                // 画面外に余裕をもって出たらリセット
                item.active = false;
                resetElement(item.el);
            }
        });
    }
};

// --- 5. 初期化（DOMContentLoaded） ---
document.addEventListener('DOMContentLoaded', () => {
    // A. タイピング用のspan事前生成
    const typingTarget = document.getElementById('typing-target');
    if (typingTarget) {
        const data = [
            { text: "「", class: "symbol" },
            { text: "ロジック", class: "keyword" },
            { text: "で", class: "text" },
            { text: "チーム", class: "variable" },
            { text: "と", class: "text" },
            { text: "システム", class: "variable" },
            { text: "を", class: "text" },
            { text: "「最適」", class: "optimum" },
            { text: "へ", class: "text" },
            { text: "導く", class: "function" },
            { text: "」", class: "symbol" },
        ];

        data.forEach(item => {
            const chars = item.text.split('');
            chars.forEach(char => {
                const span = document.createElement('span');
                span.textContent = char;
                span.classList.add(item.class);
                typingTarget.appendChild(span);
            });
        });
    }

    // B. 監視マネージャー起動
    scrollManager.init();
});










init();
