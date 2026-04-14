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


document.addEventListener("DOMContentLoaded", () => {
  const target = document.getElementById('typing-target');
  const cursor = document.querySelector('.cursor');
  
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

  // 1. spanの事前生成（最初はすべて非表示）
  data.forEach(item => {
    const chars = item.text.split('');
    chars.forEach(char => {
      const span = document.createElement('span');
      span.textContent = char;
      span.classList.add(item.class);
      target.appendChild(span);
    });
  });

  const allSpans = target.querySelectorAll('span');
  const typingSpeed = 10; 

  // 2. タイピング実行関数
  function startTyping(index) {
    if (index < allSpans.length) {
      allSpans[index].classList.add('typed');
      setTimeout(() => {
        startTyping(index + 1);
      }, typingSpeed);
    } else {
      cursor.classList.add('active');
    }
  }

  // 3. 画面内に入ったかを監視する設定
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 1 // 要素が50%見えたら実行
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // 画面内に入ったらタイピング開始
        startTyping(0);
        // 一度実行したら監視を解除（リピートさせない場合）
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // 監視開始
  observer.observe(target);
});


init();
