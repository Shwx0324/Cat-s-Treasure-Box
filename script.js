// 获取元素
const audio = document.getElementById('audio');
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const progress = document.getElementById('progress');
const progressBar = document.querySelector('.progress-bar');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const volumeEl = document.getElementById('volume');
const titleEl = document.getElementById('title');
const artistEl = document.getElementById('artist');
const coverEl = document.getElementById('cover');
const albumCover = document.querySelector('.album-cover');
const playlistEl = document.getElementById('playlist');
const musicInput = document.getElementById('music-input');

// 播放列表
let songs = [];
let currentIndex = 0;
let isPlaying = false;

// 示例歌曲（免费音乐）
const demoSongs = [
    {
        title: '轻松时光',
        artist: 'Demo Artist',
        src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        cover: 'https://picsum.photos/seed/song1/280/280'
    },
    {
        title: '阳光午后',
        artist: 'Demo Artist',
        src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        cover: 'https://picsum.photos/seed/song2/280/280'
    },
    {
        title: '星空漫步',
        artist: 'Demo Artist',
        src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        cover: 'https://picsum.photos/seed/song3/280/280'
    }
];

// 初始化
function init() {
    songs = [...demoSongs];
    renderPlaylist();
    if (songs.length > 0) {
        loadSong(0);
    }
    volumeEl.value = 80;
    audio.volume = 0.8;
}

// 渲染播放列表
function renderPlaylist() {
    playlistEl.innerHTML = '';
    songs.forEach((song, index) => {
        const li = document.createElement('li');
        li.textContent = `${song.title} - ${song.artist}`;
        li.addEventListener('click', () => {
            currentIndex = index;
            loadSong(currentIndex);
            playSong();
        });
        if (index === currentIndex) {
            li.classList.add('active');
        }
        playlistEl.appendChild(li);
    });
}

// 加载歌曲
function loadSong(index) {
    const song = songs[index];
    titleEl.textContent = song.title;
    artistEl.textContent = song.artist;
    audio.src = song.src;
    coverEl.src = song.cover || 'https://via.placeholder.com/280?text=🎵';
    
    // 更新播放列表高亮
    document.querySelectorAll('.playlist li').forEach((li, i) => {
        li.classList.toggle('active', i === index);
    });
}

// 播放
function playSong() {
    isPlaying = true;
    playBtn.textContent = '⏸';
    albumCover.classList.add('playing');
    audio.play();
}

// 暂停
function pauseSong() {
    isPlaying = false;
    playBtn.textContent = '▶';
    albumCover.classList.remove('playing');
    audio.pause();
}

// 上一首
function prevSong() {
    currentIndex--;
    if (currentIndex < 0) {
        currentIndex = songs.length - 1;
    }
    loadSong(currentIndex);
    playSong();
}

// 下一首
function nextSong() {
    currentIndex++;
    if (currentIndex >= songs.length) {
        currentIndex = 0;
    }
    loadSong(currentIndex);
    playSong();
}

// 格式化时间
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// 更新进度条
function updateProgress() {
    if (audio.duration) {
        const percent = (audio.currentTime / audio.duration) * 100;
        progress.style.width = `${percent}%`;
        currentTimeEl.textContent = formatTime(audio.currentTime);
    }
}

// 设置进度
function setProgress(e) {
    const width = progressBar.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;
    if (duration) {
        audio.currentTime = (clickX / width) * duration;
    }
}

// 添加本地音乐
function addLocalMusic(e) {
    const files = e.target.files;
    
    for (let file of files) {
        const url = URL.createObjectURL(file);
        const name = file.name.replace(/\.[^/.]+$/, '');
        
        songs.push({
            title: name,
            artist: '本地音乐',
            src: url,
            cover: 'https://picsum.photos/seed/' + Date.now() + '/280/280'
        });
    }
    
    renderPlaylist();
    
    // 如果是第一首歌，自动加载
    if (songs.length === files.length + demoSongs.length) {
        loadSong(currentIndex);
    }
}

// 事件监听
playBtn.addEventListener('click', () => {
    if (isPlaying) {
        pauseSong();
    } else {
        playSong();
    }
});

prevBtn.addEventListener('click', prevSong);
nextBtn.addEventListener('click', nextSong);

audio.addEventListener('timeupdate', updateProgress);

audio.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(audio.duration);
});

audio.addEventListener('ended', nextSong);

progressBar.addEventListener('click', setProgress);

volumeEl.addEventListener('input', (e) => {
    audio.volume = e.target.value / 100;
});

musicInput.addEventListener('change', addLocalMusic);

// 启动
init();
