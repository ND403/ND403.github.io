// const playlist = [
//     { src: 'video1.mp4', img: 'logo1.png', title: 'Gravity Run' },
//     { src: 'video2.mp4', img: 'logo2.png', title: 'CODE:LOADER' },
//     { src: 'video3.mp4', img: 'logo3.png', title: '百草Park' }
// ];

// let currentIndex = 0;
// const video = document.getElementById('main-video');
// const titleImg = document.getElementById('video-title-img');
// const indexContainer = document.getElementById('side-index');
// const progressInner = document.getElementById('progress-inner');


// function init() {
//     playlist.forEach((item, index) => {
//         const bar = document.createElement('div');
//         bar.classList.add('index-item');
        
//         const titleText = document.createElement('span');
//         titleText.textContent = item.title;
//         titleText.classList.add('index-item-title');
        
//         bar.appendChild(titleText);
//         bar.addEventListener('click', () => updateGallery(index));
//         indexContainer.appendChild(bar);
//     });
//     updateGallery(0);
// }

// function updateGallery(index) {
//     currentIndex = index;
//     const data = playlist[currentIndex];

//     // ロゴのフェード切り替え
//     titleImg.style.opacity = 0;
//     setTimeout(() => {
//         titleImg.src = data.img;
//         titleImg.style.opacity = 1;
//     }, 400);

//     // インデックスのアクティブ切り替え
//     const items = document.querySelectorAll('.index-item');
//     items.forEach((item, i) => {
//         item.classList.toggle('active', i === currentIndex);
//     });

//     // 動画再生
//     video.src = data.src;
//     video.load();
//     video.play().catch(e => console.log("Play blocked"));
// }

// video.addEventListener('timeupdate', () => {
//     if (video.duration) {
//         const percent = (video.currentTime / video.duration) * 100;
//         progressInner.style.width = percent + '%';
//     }
// });

// video.addEventListener('ended', () => {
//     updateGallery((currentIndex + 1) % playlist.length);
// });

// init();


