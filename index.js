// Mini Music Player for SillyTavern
(function () {
    const extensionName = "mini-music-player";
    const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;

    // 登录状态
    let loginStatus = {
        netease: { loggedIn: false, username: "", avatar: "" },
        qq: { loggedIn: false, username: "", avatar: "" }
    };

    // 播放列表数据
    let playlist = [];
    let currentIndex = 0;
    let isPlaying = false;

    // 设置面板 HTML
    const settingsHTML = `
    <div class="music-player-settings">
        <div class="inline-drawer">
            <div class="inline-drawer-toggle inline-drawer-header">
                <b>🎵 Mini Music Player</b>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
            </div>
            <div class="inline-drawer-content">
                <!-- 网易云音乐 -->
                <div class="music-platform-section">
                    <h4>☁️ 网易云音乐</h4>
                    <div id="netease-status" class="login-status">
                        <span class="status-dot offline"></span>
                        <span class="status-text">未登录</span>
                    </div>
                    <div id="netease-user-info" class="user-info" style="display:none;">
                        <img class="user-avatar" src="" alt="avatar">
                        <span class="user-name"></span>
                    </div>
                    <button id="netease-login-btn" class="menu_button">扫码登录</button>
                    <button id="netease-logout-btn" class="menu_button" style="display:none;">退出登录</button>
                </div>

                <!-- QQ音乐 -->
                <div class="music-platform-section">
                    <h4>🎵 QQ音乐</h4>
                    <div id="qq-status" class="login-status">
                        <span class="status-dot offline"></span>
                        <span class="status-text">未登录</span>
                    </div>
                    <div id="qq-user-info" class="user-info" style="display:none;">
                        <img class="user-avatar" src="" alt="avatar">
                        <span class="user-name"></span>
                    </div>
                    <button id="qq-login-btn" class="menu_button">扫码登录</button>
                    <button id="qq-logout-btn" class="menu_button" style="display:none;">退出登录</button>
                </div>

                <!-- 播放器设置 -->
                <div class="music-platform-section">
                    <h4>⚙️ 播放器设置</h4>
                    <label class="checkbox_label">
                        <input type="checkbox" id="player-visible-toggle" checked>
                        <span>显示播放器</span>
                    </label>
                    <label class="checkbox_label">
                        <input type="checkbox" id="auto-play-toggle">
                        <span>自动播放</span>
                    </label>
                    <div class="volume-setting">
                        <span>默认音量：</span>
                        <input type="range" id="default-volume" min="0" max="100" value="50">
                        <span id="volume-value">50%</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;

    // 二维码弹窗 HTML
    const qrModalHTML = `
    <div id="qr-login-modal" class="qr-modal" style="display:none;">
        <div class="qr-modal-content">
            <div class="qr-modal-header">
                <h3 id="qr-modal-title">扫码登录</h3>
                <button id="qr-modal-close" class="qr-close-btn">✕</button>
            </div>
            <div class="qr-modal-body">
                <div id="qr-code-container">
                    <div class="qr-placeholder">
                        <div class="qr-loading">正在加载二维码...</div>
                    </div>
                </div>
                <p class="qr-tip">请使用手机APP扫描二维码登录</p>
                <div id="qr-status" class="qr-status">等待扫码...</div>
            </div>
        </div>
    </div>
    `;

    // 播放器 HTML
    const playerHTML = `
    <div id="mini-music-player">
        <audio id="player-audio"></audio>
        <div class="player-container">
            <div class="player-info">
                <span id="song-title">未选择歌曲</span>
            </div>
            <div class="player-controls">
                <button id="prev-btn" title="上一首">⏮</button>
                <button id="play-btn" title="播放/暂停">▶</button>
                <button id="next-btn" title="下一首">⏭</button>
                <input type="range" id="volume-slider" min="0" max="100" value="50" title="音量">
                <button id="playlist-btn" title="播放列表">📁</button>
                <button id="minimize-btn" title="最小化">➖</button>
            </div>
        </div>
        <div id="playlist-panel" style="display:none;">
            <div class="playlist-header">
                <span>播放列表</span>
                <input type="file" id="add-music" accept="audio/*" multiple style="display:none;">
                <button id="add-music-btn">➕ 添加本地音乐</button>
            </div>
            <ul id="playlist"></ul>
        </div>
    </div>
    `;

    // 加载设置
    function loadSettings() {
        const saved = localStorage.getItem("miniMusicPlayerSettings");
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                loginStatus = settings.loginStatus || loginStatus;
                return settings;
            } catch (e) {
                console.error("Failed to load settings:", e);
            }
        }
        return {
            visible: true,
            autoPlay: false,
            volume: 50,
            loginStatus: loginStatus
        };
    }

    // 保存设置
    function saveSettings(settings) {
        settings.loginStatus = loginStatus;
        localStorage.setItem("miniMusicPlayerSettings", JSON.stringify(settings));
    }

    // 更新登录状态显示
    function updateLoginStatusUI(platform) {
        const status = loginStatus[platform];
        const statusEl = document.getElementById(`${platform}-status`);
        const userInfoEl = document.getElementById(`${platform}-user-info`);
        const loginBtn = document.getElementById(`${platform}-login-btn`);
        const logoutBtn = document.getElementById(`${platform}-logout-btn`);

        if (!statusEl) return;

        const statusDot = statusEl.querySelector(".status-dot");
        const statusText = statusEl.querySelector(".status-text");

        if (status.loggedIn) {
            statusDot.className = "status-dot online";
            statusText.textContent = "已登录";
            userInfoEl.style.display = "flex";
            userInfoEl.querySelector(".user-avatar").src = status.avatar || "https://via.placeholder.com/32";
            userInfoEl.querySelector(".user-name").textContent = status.username;
            loginBtn.style.display = "none";
            logoutBtn.style.display = "inline-block";
        } else {
            statusDot.className = "status-dot offline";
            statusText.textContent = "未登录";
            userInfoEl.style.display = "none";
            loginBtn.style.display = "inline-block";
            logoutBtn.style.display = "none";
        }
    }

    // 显示二维码弹窗
    function showQRModal(platform) {
        const modal = document.getElementById("qr-login-modal");
        const title = document.getElementById("qr-modal-title");
        const qrContainer = document.getElementById("qr-code-container");
        const qrStatus = document.getElementById("qr-status");

        const platformNames = {
            netease: "网易云音乐",
            qq: "QQ音乐"
        };

        title.textContent = `${platformNames[platform]} 扫码登录`;
        modal.style.display = "flex";
        modal.dataset.platform = platform;

        // 模拟生成二维码
        qrContainer.innerHTML = `
            <div class="qr-code-box">
                <svg viewBox="0 0 100 100" width="180" height="180">
                    <rect fill="#ffffff" width="100" height="100"/>
                    ${generateFakeQRPattern()}
                </svg>
            </div>
        `;
        qrStatus.textContent = "请使用手机扫描二维码";
        qrStatus.className = "qr-status waiting";

        // 模拟扫码过程（演示用）
        simulateScanProcess(platform);
    }

    // 生成模拟二维码图案
    function generateFakeQRPattern() {
        let pattern = "";
        const size = 5;
        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < 20; j++) {
                if (Math.random() > 0.5) {
                    pattern += `<rect x="${i * size}" y="${j * size}" width="${size}" height="${size}" fill="#000"/>`;
                }
            }
        }
        // 添加定位点
        pattern += `<rect x="5" y="5" width="20" height="20" fill="#000"/>`;
        pattern += `<rect x="10" y="10" width="10" height="10" fill="#fff"/>`;
        pattern += `<rect x="75" y="5" width="20" height="20" fill="#000"/>`;
        pattern += `<rect x="80" y="10" width="10" height="10" fill="#fff"/>`;
        pattern += `<rect x="5" y="75" width="20" height="20" fill="#000"/>`;
        pattern += `<rect x="10" y="80" width="10" height="10" fill="#fff"/>`;
        return pattern;
    }

    // 模拟扫码过程
    function simulateScanProcess(platform) {
        const qrStatus = document.getElementById("qr-status");
        
        // 提示用户这是演示模式
        setTimeout(() => {
            qrStatus.textContent = "💡 提示：点击二维码模拟登录成功";
            qrStatus.className = "qr-status info";
        }, 2000);

        // 点击二维码模拟登录
        const qrContainer = document.getElementById("qr-code-container");
        qrContainer.onclick = () => {
            qrStatus.textContent = "✓ 扫码成功，正在登录...";
            qrStatus.className = "qr-status success";
            
            setTimeout(() => {
                // 模拟登录成功
                loginStatus[platform] = {
                    loggedIn: true,
                    username: platform === "netease" ? "网易云用户" : "QQ音乐用户",
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${platform}`
                };
                
                updateLoginStatusUI(platform);
                saveSettings(loadSettings());
                
                // 关闭弹窗
                document.getElementById("qr-login-modal").style.display = "none";
                
                // 显示成功提示
                toastr.success(`${platform === "netease" ? "网易云音乐" : "QQ音乐"} 登录成功！`);
            }, 1500);
        };
    }

    // 退出登录
    function logout(platform) {
        loginStatus[platform] = {
            loggedIn: false,
            username: "",
            avatar: ""
        };
        updateLoginStatusUI(platform);
        saveSettings(loadSettings());
        toastr.info(`已退出 ${platform === "netease" ? "网易云音乐" : "QQ音乐"}`);
    }

    // 初始化设置面板
    function initSettingsPanel() {
        const settingsContainer = document.getElementById("extensions_settings");
        if (!settingsContainer) {
            console.error("Extensions settings container not found");
            return;
        }

        // 添加设置面板
        const settingsDiv = document.createElement("div");
        settingsDiv.innerHTML = settingsHTML;
        settingsContainer.appendChild(settingsDiv);

        // 添加二维码弹窗
        const modalDiv = document.createElement("div");
        modalDiv.innerHTML = qrModalHTML;
        document.body.appendChild(modalDiv);

        // 加载保存的设置
        const settings = loadSettings();

        // 绑定事件
        // 网易云登录
        document.getElementById("netease-login-btn").addEventListener("click", () => {
            showQRModal("netease");
        });
        document.getElementById("netease-logout-btn").addEventListener("click", () => {
            logout("netease");
        });

        // QQ音乐登录
        document.getElementById("qq-login-btn").addEventListener("click", () => {
            showQRModal("qq");
        });
        document.getElementById("qq-logout-btn").addEventListener("click", () => {
            logout("qq");
        });

        // 关闭弹窗
        document.getElementById("qr-modal-close").addEventListener("click", () => {
            document.getElementById("qr-login-modal").style.display = "none";
        });

        // 点击背景关闭
        document.getElementById("qr-login-modal").addEventListener("click", (e) => {
            if (e.target.id === "qr-login-modal") {
                e.target.style.display = "none";
            }
        });

        // 播放器可见性
        const visibleToggle = document.getElementById("player-visible-toggle");
        visibleToggle.checked = settings.visible !== false;
        visibleToggle.addEventListener("change", (e) => {
            const player = document.getElementById("mini-music-player");
            if (player) {
                player.style.display = e.target.checked ? "block" : "none";
            }
            settings.visible = e.target.checked;
            saveSettings(settings);
        });

        // 自动播放
        const autoPlayToggle = document.getElementById("auto-play-toggle");
        autoPlayToggle.checked = settings.autoPlay === true;
        autoPlayToggle.addEventListener("change", (e) => {
            settings.autoPlay = e.target.checked;
            saveSettings(settings);
        });

        // 默认音量
        const volumeSlider = document.getElementById("default-volume");
        const volumeValue = document.getElementById("volume-value");
        volumeSlider.value = settings.volume || 50;
        volumeValue.textContent = `${volumeSlider.value}%`;
        volumeSlider.addEventListener("input", (e) => {
            volumeValue.textContent = `${e.target.value}%`;
            settings.volume = parseInt(e.target.value);
            saveSettings(settings);
            // 同步到播放器
            const playerVolume = document.getElementById("volume-slider");
            if (playerVolume) {
                playerVolume.value = e.target.value;
            }
            const audio = document.getElementById("player-audio");
            if (audio) {
                audio.volume = e.target.value / 100;
            }
        });

        // 更新登录状态
        updateLoginStatusUI("netease");
        updateLoginStatusUI("qq");

        // 折叠面板功能
        const drawerToggle = settingsDiv.querySelector(".inline-drawer-toggle");
        const drawerContent = settingsDiv.querySelector(".inline-drawer-content");
        const drawerIcon = settingsDiv.querySelector(".inline-drawer-icon");
        
        drawerToggle.addEventListener("click", () => {
            const isOpen = drawerContent.style.display !== "none";
            drawerContent.style.display = isOpen ? "none" : "block";
            drawerIcon.classList.toggle("up", !isOpen);
            drawerIcon.classList.toggle("down", isOpen);
        });
    }

    // 初始化播放器
    function initPlayer() {
        const settings = loadSettings();

        // 插入播放器到页面
        const container = document.createElement("div");
        container.innerHTML = playerHTML;
        document.body.appendChild(container);

        const player = document.getElementById("mini-music-player");
        if (settings.visible === false) {
            player.style.display = "none";
        }

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
        const minimizeBtn = document.getElementById("minimize-btn");

        // 设置音量
        audio.volume = (settings.volume || 50) / 100;
        volumeSlider.value = settings.volume || 50;

        // 播放/暂停
        playBtn.addEventListener("click", () => {
            if (playlist.length === 0) {
                toastr.info("请先添加音乐");
                return;
            }
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

        // 最小化
        let isMinimized = false;
        minimizeBtn.addEventListener("click", () => {
            const container = player.querySelector(".player-container");
            const info = player.querySelector(".player-info");
            const controls = player.querySelectorAll(".player-controls button:not(#minimize-btn), .player-controls input");
            
            isMinimized = !isMinimized;
            
            if (isMinimized) {
                info.style.display = "none";
                controls.forEach(el => el.style.display = "none");
                playlistPanel.style.display = "none";
                minimizeBtn.textContent = "➕";
                container.style.minWidth = "auto";
            } else {
                info.style.display = "block";
                controls.forEach(el => el.style.display = "");
                minimizeBtn.textContent = "➖";
                container.style.minWidth = "280px";
            }
        });

        // 添加音乐
        addMusicBtn.addEventListener("click", () => addMusicInput.click());
        addMusicInput.addEventListener("change", (e) => {
            const files = Array.from(e.target.files);
            files.forEach(file => {
                const url = URL.createObjectURL(file);
                playlist.push({ name: file.name.replace(/\.[^/.]+$/, ""), url: url });
            });
            renderPlaylist();
            if (playlist.length === files.length) {
                loadSong(0);
            }
            toastr.success(`已添加 ${files.length} 首歌曲`);
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
                li.innerHTML = `
                    <span class="song-name">${song.name}</span>
                    <button class="remove-song" data-index="${i}">✕</button>
                `;
                li.className = i === currentIndex ? "active" : "";
                li.querySelector(".song-name").addEventListener("click", () => {
                    currentIndex = i;
                    loadSong(i);
                });
                li.querySelector(".remove-song").addEventListener("click", (e) => {
                    e.stopPropagation();
                    const idx = parseInt(e.target.dataset.index);
                    playlist.splice(idx, 1);
                    if (currentIndex >= playlist.length) {
                        currentIndex = Math.max(0, playlist.length - 1);
                    }
                    if (idx === currentIndex && playlist.length > 0) {
                        loadSong(currentIndex);
                    } else if (playlist.length === 0) {
                        audio.pause();
                        audio.src = "";
                        songTitle.textContent = "未选择歌曲";
                        playBtn.textContent = "▶";
                        isPlaying = false;
                    }
                    renderPlaylist();
                });
                playlistEl.appendChild(li);
            });
        }
    }

    // 主初始化函数
    function init() {
        // 等待 SillyTavern 加载完成
        const checkReady = setInterval(() => {
            if (document.getElementById("extensions_settings")) {
                clearInterval(checkReady);
                initSettingsPanel();
                initPlayer();
                console.log("Mini Music Player initialized");
            }
        }, 500);

        // 超时保护
        setTimeout(() => {
            clearInterval(checkReady);
            if (!document.getElementById("mini-music-player")) {
                initPlayer();
                console.log("Mini Music Player initialized (fallback)");
            }
        }, 10000);
    }

    // 启动
    if (document.readyState === "complete" || document.readyState === "interactive") {
        init();
    } else {
        window.addEventListener("DOMContentLoaded", init);
    }
})();    // 初始化插件
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
