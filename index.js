// Mini Music Player for SillyTavern
(function () {
    const extensionName = "mini-music-player";

    // 播放器 HTML
    const playerHTML = `
    <div id="mini-music-player">
        <audio id="player-audio"></audio>
        <div class="player-container">
            <div class="player-info">
                <span id="song-title">未选择歌曲</span>
            </div>
            <div class="player-controls">
                <button id="prev-btn">⏮</button>
                <button id="play-btn">▶</button>
                <button id="next-btn">⏭</button>
                <input type="range" id="volume-slider" min="0" max="100" value="50">
                <button id="playlist-btn">📁</button>
            </div>
        </div>
        <div id="playlist-panel" style="display:none;">
            <div class="playlist-header">
                <span>播放列表</span>
                <input type="file" id="add-music" accept="audio/*" multiple style="display:none;">
                <button id="add-music-btn">➕ 添加音乐</button>
            </div>
            <ul id="playlist"></ul>
        </div>
    </div>
    `;

    // 播放列表数据
    let playlist = [];
    let currentIndex = 0;
    let isPlaying = false;

    // 初始化插件
    function init() {
        // 插入播放器到页面底部
        const container = document.createElement("div");
        container.innerHTML = playerHTML;
        document.body.appendChild(container);

        // 获取元素
        const audio = document.getElementById("player-audio");
        const playBtn = document.getElementById("play-btn");
        const prevBtn = document.getElementById("prev-btn");
        const nextBtn = document.getElementById("next-btn");
        const volumeSlider = document.getElementById("volume-slider");
        const playlistBtn = document.getElementById("playlist-btn");
        const playlistPanel = document.getElementById("playlist-panel");
        const addMusicBtn = document.getElementById("add-music-btn");
        const addMusicInput = document.getElementById("add-music");
        const songTitle = document.getElementById("song-title");
        const playlistEl = document.getElementById("playlist");

        // 设置音量
        audio.volume = 0.5;

        // 播放/暂停
        playBtn.addEventListener("click", () => {
            if (playlist.length === 0) return;
            if (isPlaying) {
                audio.pause();
                playBtn.textContent = "▶";
            } else {
                audio.play();
                playBtn.textContent = "⏸";
            }
            isPlaying = !isPlaying;
        });

        // 上一首
        prevBtn.addEventListener("click", () => {
            if (playlist.length === 0) return;
            currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
            loadSong(currentIndex);
        });

        // 下一首
        nextBtn.addEventListener("click", () => {
            if (playlist.length === 0) return;
            currentIndex = (currentIndex + 1) % playlist.length;
            loadSong(currentIndex);
        });

        // 音量
        volumeSlider.addEventListener("input", (e) => {
            audio.volume = e.target.value / 100;
        });

        // 播放列表开关
        playlistBtn.addEventListener("click", () => {
            playlistPanel.style.display = playlistPanel.style.display === "none" ? "block" : "none";
        });

        // 添加音乐
        addMusicBtn.addEventListener("click", () => addMusicInput.click());
        addMusicInput.addEventListener("change", (e) => {
            const files = Array.from(e.target.files);
            files.forEach(file => {
                const url = URL.createObjectURL(file);
                playlist.push({ name: file.name, url: url });
            });
            renderPlaylist();
            if (playlist.length === files.length) {
                loadSong(0);
            }
        });

        // 歌曲结束自动下一首
        audio.addEventListener("ended", () => {
            currentIndex = (currentIndex + 1) % playlist.length;
            loadSong(currentIndex);
        });

        // 加载歌曲
        function loadSong(index) {
            if (playlist.length === 0) return;
            const song = playlist[index];
            audio.src = song.url;
            songTitle.textContent = song.name;
            audio.play();
            playBtn.textContent = "⏸";
            isPlaying = true;
            renderPlaylist();
        }

        // 渲染播放列表
        function renderPlaylist() {
            playlistEl.innerHTML = "";
            playlist.forEach((song, i) => {
                const li = document.createElement("li");
                li.textContent = song.name;
                li.className = i === currentIndex ? "active" : "";
                li.addEventListener("click", () => {
                    currentIndex = i;
                    loadSong(i);
                });
                playlistEl.appendChild(li);
            });
        }
    }

    // 等待 jQuery 加载完成后初始化
    if (document.readyState === "complete") {
        init();
    } else {
        window.addEventListener("load", init);
    }
})();
