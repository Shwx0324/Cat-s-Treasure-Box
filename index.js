import { extension_settings, getContext } from "../../../extensions.js";
import { saveSettingsDebounced } from "../../../../script.js";

const extensionName = "music-player";

// 默认设置
const defaultSettings = {
    enabled: true,
    visible: true,
    autoPlay: false,
    volume: 50,
    netease: { loggedIn: false, username: "", avatar: "" },
    qq: { loggedIn: false, username: "", avatar: "" }
};

// 播放器状态
let playlist = [];
let currentIndex = 0;
let isPlaying = false;
let audio = null;

// 设置面板HTML
const settingsHtml = `
<div id="mp_settings_container">
    <div class="inline-drawer">
        <div class="inline-drawer-toggle inline-drawer-header">
            <b>🎵 迷你音乐播放器</b>
            <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
        </div>
        <div class="inline-drawer-content">
            <div class="mp_block">
                <div class="mp_title">☁️ 网易云音乐</div>
                <div id="mp_netease_status" class="mp_status_row">
                    <span class="mp_dot offline"></span>
                    <span class="mp_text">未登录</span>
                </div>
                <div id="mp_netease_user" class="mp_user" style="display:none;">
                    <img class="mp_avatar" src="">
                    <span class="mp_uname"></span>
                </div>
                <div class="mp_btns">
                    <input type="button" id="mp_netease_login" class="menu_button" value="扫码登录">
                    <input type="button" id="mp_netease_logout" class="menu_button" value="退出" style="display:none;">
                </div>
            </div>
            <div class="mp_block">
                <div class="mp_title">🎵 QQ音乐</div>
                <div id="mp_qq_status" class="mp_status_row">
                    <span class="mp_dot offline"></span>
                    <span class="mp_text">未登录</span>
                </div>
                <div id="mp_qq_user" class="mp_user" style="display:none;">
                    <img class="mp_avatar" src="">
                    <span class="mp_uname"></span>
                </div>
                <div class="mp_btns">
                    <input type="button" id="mp_qq_login" class="menu_button" value="扫码登录">
                    <input type="button" id="mp_qq_logout" class="menu_button" value="退出" style="display:none;">
                </div>
            </div>
            <div class="mp_block">
                <div class="mp_title">⚙️ 设置</div>
                <label class="checkbox_label">
                    <input type="checkbox" id="mp_visible" checked>
                    <span>显示播放器</span>
                </label>
                <label class="checkbox_label">
                    <input type="checkbox" id="mp_autoplay">
                    <span>自动播放</span>
                </label>
                <div class="mp_vol_row">
                    <span>音量</span>
                    <input type="range" id="mp_def_vol" min="0" max="100" value="50">
                    <span id="mp_vol_num">50%</span>
                </div>
            </div>
        </div>
    </div>
</div>
`;

// 二维码弹窗
const qrHtml = `
<div id="mp_qr_modal">
    <div class="mp_qr_box">
        <div class="mp_qr_head">
            <span class="mp_qr_title">扫码登录</span>
            <span id="mp_qr_close">✕</span>
        </div>
        <div class="mp_qr_body">
            <div id="mp_qr_img"></div>
            <div id="mp_qr_tip">点击二维码模拟登录</div>
        </div>
    </div>
</div>
`;

// 播放器
const playerHtml = `
<div id="mp_player">
    <div class="mp_main">
        <div id="mp_song">未选择歌曲</div>
        <div class="mp_ctrl">
            <button id="mp_prev">⏮</button>
            <button id="mp_play">▶</button>
            <button id="mp_next">⏭</button>
            <input type="range" id="mp_vol" min="0" max="100" value="50">
            <button id="mp_list">📁</button>
            <button id="mp_min">➖</button>
        </div>
    </div>
    <div id="mp_pl_panel">
        <div class="mp_pl_head">
            <span>播放列表</span>
            <label class="menu_button mp_add_label">
                ➕ 添加
                <input type="file" id="mp_files" accept="audio/*" multiple hidden>
            </label>
        </div>
        <ul id="mp_pl_list"></ul>
    </div>
</div>
`;

// 生成假二维码
function fakeQR() {
    let s = '<svg viewBox="0 0 100 100" width="150" height="150"><rect fill="#fff" width="100" height="100"/>';
    for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 20; j++) {
            if (Math.random() > 0.5) s += `<rect x="${i*5}" y="${j*5}" width="5" height="5" fill="#000"/>`;
        }
    }
    s += '<rect x="5" y="5" width="20" height="20" fill="#000"/><rect x="10" y="10" width="10" height="10" fill="#fff"/>';
    s += '<rect x="75" y="5" width="20" height="20" fill="#000"/><rect x="80" y="10" width="10" height="10" fill="#fff"/>';
    s += '<rect x="5" y="75" width="20" height="20" fill="#000"/><rect x="10" y="80" width="10" height="10" fill="#fff"/>';
    s += '</svg>';
    return s;
}

// 更新登录UI
function updateLogin(p) {
    const d = extension_settings[extensionName][p];
    const $s = $(`#mp_${p}_status`);
    const $u = $(`#mp_${p}_user`);
    const $lin = $(`#mp_${p}_login`);
    const $lout = $(`#mp_${p}_logout`);
    
    if (d && d.loggedIn) {
        $s.find('.mp_dot').removeClass('offline').addClass('online');
        $s.find('.mp_text').text('已登录');
        $u.show().find('.mp_avatar').attr('src', d.avatar);
        $u.find('.mp_uname').text(d.username);
        $lin.hide();
        $lout.show();
    } else {
        $s.find('.mp_dot').removeClass('online').addClass('offline');
        $s.find('.mp_text').text('未登录');
        $u.hide();
        $lin.show();
        $lout.hide();
    }
}

// 显示二维码
function showQR(p) {
    const n = { netease: '网易云音乐', qq: 'QQ音乐' };
    $('#mp_qr_title').text(`${n[p]} 扫码登录`);
    $('#mp_qr_img').html(`<div class="mp_qr_code">${fakeQR()}</div>`);
    $('#mp_qr_tip').text('点击二维码模拟登录');
    $('#mp_qr_modal').data('p', p).fadeIn(200);
}

// 退出登录
function doLogout(p) {
    const n = { netease: '网易云音乐', qq: 'QQ音乐' };
    extension_settings[extensionName][p] = { loggedIn: false, username: '', avatar: '' };
    saveSettingsDebounced();
    updateLogin(p);
    toastr.info(`已退出 ${n[p]}`);
}

// 播放歌曲
function playSong(i) {
    if (!playlist.length) return;
    currentIndex = i;
    audio.src = playlist[i].url;
    $('#mp_song').text(playlist[i].name);
    audio.play();
    $('#mp_play').text('⏸');
    isPlaying = true;
    renderPL();
}

// 渲染播放列表
function renderPL() {
    const $ul = $('#mp_pl_list').empty();
    playlist.forEach((s, i) => {
        const $li = $(`<li class="${i===currentIndex?'active':''}"><span class="mp_sname">${s.name}</span><span class="mp_sdel">✕</span></li>`);
        $li.find('.mp_sname').on('click', () => playSong(i));
        $li.find('.mp_sdel').on('click', e => {
            e.stopPropagation();
            URL.revokeObjectURL(playlist[i].url);
            playlist.splice(i, 1);
            if (!playlist.length) {
                audio.pause(); audio.src = '';
                $('#mp_song').text('未选择歌曲');
                $('#mp_play').text('▶');
                isPlaying = false;
            } else if (i <= currentIndex) {
                currentIndex = Math.max(0, currentIndex - 1);
            }
            renderPL();
        });
        $ul.append($li);
    });
}

// 初始化
jQuery(async () => {
    // 加载设置
    if (!extension_settings[extensionName]) {
        extension_settings[extensionName] = Object.assign({}, defaultSettings);
    }
    const settings = extension_settings[extensionName];
    
    // ========== 关键修复：找到正确的容器 ==========
    // 尝试多个可能的选择器
    const $container = $("#extensions_settings2, #extensions_settings, #extension_settings").first();
    
    if ($container.length) {
        $container.append(settingsHtml);
        console.log("[音乐播放器] 设置面板已添加到:", $container.attr('id'));
    } else {
        // 如果找不到，等待后重试
        console.log("[音乐播放器] 未找到容器，3秒后重试");
        await new Promise(r => setTimeout(r, 3000));
        
        const $retry = $("#extensions_settings2, #extensions_settings, #extension_settings").first();
        if ($retry.length) {
            $retry.append(settingsHtml);
            console.log("[音乐播放器] 重试成功");
        } else {
            // 最后尝试：添加到 body 中一个固定位置
            console.log("[音乐播放器] 使用备用方案");
            $(".drawer-content, #right-nav-panel, body").first().append(settingsHtml);
        }
    }
    
    // 添加弹窗和播放器
    $('body').append(qrHtml).append(playerHtml);
    $('#mp_qr_modal').hide();
    $('#mp_pl_panel').hide();
    
    // 音频
    audio = new Audio();
    audio.volume = (settings.volume || 50) / 100;
    
    // 播放器显示
    if (settings.visible === false) $('#mp_player').hide();
    
    // ===== 设置面板事件 =====
    $('#mp_visible').prop('checked', settings.visible !== false).on('change', function() {
        settings.visible = this.checked;
        $('#mp_player').toggle(this.checked);
        saveSettingsDebounced();
    });
    
    $('#mp_autoplay').prop('checked', settings.autoPlay).on('change', function() {
        settings.autoPlay = this.checked;
        saveSettingsDebounced();
    });
    
    $('#mp_def_vol').val(settings.volume || 50).on('input', function() {
        settings.volume = +this.value;
        $('#mp_vol_num').text(this.value + '%');
        $('#mp_vol').val(this.value);
        audio.volume = this.value / 100;
        saveSettingsDebounced();
    });
    $('#mp_vol_num').text((settings.volume || 50) + '%');
    
    // 登录
    $('#mp_netease_login').on('click', () => showQR('netease'));
    $('#mp_netease_logout').on('click', () => doLogout('netease'));
    $('#mp_qq_login').on('click', () => showQR('qq'));
    $('#mp_qq_logout').on('click', () => doLogout('qq'));
    
    // 二维码弹窗
    $('#mp_qr_close').on('click', () => $('#mp_qr_modal').fadeOut(200));
    $('#mp_qr_modal').on('click', function(e) {
        if (e.target === this) $(this).fadeOut(200);
    });
    $('#mp_qr_img').on('click', function() {
        const p = $('#mp_qr_modal').data('p');
        const n = { netease: '网易云音乐', qq: 'QQ音乐' };
        $('#mp_qr_tip').text('✓ 登录成功');
        setTimeout(() => {
            settings[p] = {
                loggedIn: true,
                username: p === 'netease' ? '网易云用户' : 'QQ音乐用户',
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${p}${Date.now()}`
            };
            saveSettingsDebounced();
            updateLogin(p);
            $('#mp_qr_modal').fadeOut(200);
            toastr.success(`${n[p]} 登录成功！`);
        }, 800);
    });
    
    updateLogin('netease');
    updateLogin('qq');
    
    // ===== 播放器事件 =====
    $('#mp_play').on('click', function() {
        if (!playlist.length) { toastr.info('请先添加音乐'); return; }
        if (isPlaying) { audio.pause(); $(this).text('▶'); }
        else { audio.play(); $(this).text('⏸'); }
        isPlaying = !isPlaying;
    });
    
    $('#mp_prev').on('click', () => {
        if (!playlist.length) return;
        currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
        playSong(currentIndex);
    });
    
    $('#mp_next').on('click', () => {
        if (!playlist.length) return;
        currentIndex = (currentIndex + 1) % playlist.length;
        playSong(currentIndex);
    });
    
    $('#mp_vol').val(settings.volume || 50).on('input', function() {
        audio.volume = this.value / 100;
    });
    
    $('#mp_list').on('click', () => $('#mp_pl_panel').slideToggle(200));
    
    let mini = false;
    $('#mp_min').on('click', function() {
        mini = !mini;
        $('#mp_song, #mp_prev, #mp_next, #mp_vol, #mp_list').toggle(!mini);
        if (mini) $('#mp_pl_panel').slideUp(200);
        $(this).text(mini ? '➕' : '➖');
    });
    
    $('#mp_files').on('change', function() {
        const fs = Array.from(this.files);
        const start = playlist.length;
        fs.forEach(f => playlist.push({ name: f.name.replace(/\.[^.]+$/, ''), url: URL.createObjectURL(f) }));
        renderPL();
        if (start === 0 && playlist.length) playSong(0);
        toastr.success(`已添加 ${fs.length} 首歌曲`);
        this.value = '';
    });
    
    audio.onended = () => {
        if (playlist.length) {
            currentIndex = (currentIndex + 1) % playlist.length;
            playSong(currentIndex);
        }
    };
    
    console.log("[音乐播放器] ✓ 初始化完成");
});                svg += `<rect x="${i*5}" y="${j*5}" width="5" height="5" fill="#000"/>`;
            }
        }
    }
    svg += '<rect x="5" y="5" width="20" height="20" fill="#000"/><rect x="10" y="10" width="10" height="10" fill="#fff"/>';
    svg += '<rect x="75" y="5" width="20" height="20" fill="#000"/><rect x="80" y="10" width="10" height="10" fill="#fff"/>';
    svg += '<rect x="5" y="75" width="20" height="20" fill="#000"/><rect x="10" y="80" width="10" height="10" fill="#fff"/>';
    svg += '</svg>';
    return svg;
}

// 更新登录状态显示
function updateLoginUI(platform) {
    const settings = extension_settings[extensionName];
    const data = settings[platform];
    
    const $status = $(`#mp_${platform}_status`);
    const $user = $(`#mp_${platform}_user`);
    const $loginBtn = $(`#mp_${platform}_login`);
    const $logoutBtn = $(`#mp_${platform}_logout`);
    
    if (!$status.length) return;
    
    if (data && data.loggedIn) {
        $status.find('.mp_status_dot').removeClass('offline').addClass('online');
        $status.find('.mp_status_text').text('已登录');
        $user.show().find('.mp_avatar').attr('src', data.avatar);
        $user.find('.mp_name').text(data.username);
        $loginBtn.hide();
        $logoutBtn.show();
    } else {
        $status.find('.mp_status_dot').removeClass('online').addClass('offline');
        $status.find('.mp_status_text').text('未登录');
        $user.hide();
        $loginBtn.show();
        $logoutBtn.hide();
    }
}

// 显示二维码弹窗
function showQRModal(platform) {
    const names = { netease: '网易云音乐', qq: 'QQ音乐' };
    const $modal = $('#mp_qr_modal');
    
    $modal.find('.mp_qr_title').text(`${names[platform]} 扫码登录`);
    $modal.find('.mp_qr_code').html(`<div class="mp_qr_box">${generateFakeQR()}</div>`);
    $modal.find('.mp_qr_tip').text('点击二维码模拟登录');
    $modal.data('platform', platform).fadeIn(200);
    
    $modal.find('.mp_qr_code').off('click').on('click', function() {
        const p = $modal.data('platform');
        $modal.find('.mp_qr_tip').text('✓ 登录成功！');
        
        setTimeout(() => {
            extension_settings[extensionName][p] = {
                loggedIn: true,
                username: p === 'netease' ? '网易云用户' : 'QQ音乐用户',
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${p}${Date.now()}`
            };
            saveSettingsDebounced();
            updateLoginUI(p);
            $modal.fadeOut(200);
            toastr.success(`${names[p]} 登录成功！`);
        }, 800);
    });
}

// 退出登录
function doLogout(platform) {
    const names = { netease: '网易云音乐', qq: 'QQ音乐' };
    extension_settings[extensionName][platform] = { loggedIn: false, username: '', avatar: '' };
    saveSettingsDebounced();
    updateLoginUI(platform);
    toastr.info(`已退出 ${names[platform]}`);
}

// 加载歌曲
function loadSong(index) {
    if (playlist.length === 0) return;
    currentIndex = index;
    const song = playlist[index];
    audio.src = song.url;
    $('#mp_now_playing').text(song.name);
    audio.play();
    $('#mp_play_btn').text('⏸');
    isPlaying = true;
    renderPlaylist();
}

// 渲染播放列表
function renderPlaylist() {
    const $list = $('#mp_playlist_ul');
    $list.empty();
    playlist.forEach((song, i) => {
        const $li = $(`<li class="${i === currentIndex ? 'active' : ''}">
            <span class="mp_song_name">${song.name}</span>
            <span class="mp_song_del" data-idx="${i}">✕</span>
        </li>`);
        $li.find('.mp_song_name').on('click', () => loadSong(i));
        $li.find('.mp_song_del').on('click', function(e) {
            e.stopPropagation();
            const idx = parseInt($(this).data('idx'));
            URL.revokeObjectURL(playlist[idx].url);
            playlist.splice(idx, 1);
            if (playlist.length === 0) {
                audio.pause();
                audio.src = '';
                $('#mp_now_playing').text('未选择歌曲');
                $('#mp_play_btn').text('▶');
                isPlaying = false;
            } else if (idx <= currentIndex) {
                currentIndex = Math.max(0, currentIndex - 1);
            }
            renderPlaylist();
        });
        $list.append($li);
    });
}

// 初始化设置面板
function initSettings() {
    const settings = extension_settings[extensionName];
    
    // 显示/隐藏播放器
    $('#mp_show_player').prop('checked', settings.visible !== false).on('change', function() {
        extension_settings[extensionName].visible = this.checked;
        $('#mp_player').toggle(this.checked);
        saveSettingsDebounced();
    });
    
    // 自动播放
    $('#mp_autoplay').prop('checked', settings.autoPlay === true).on('change', function() {
        extension_settings[extensionName].autoPlay = this.checked;
        saveSettingsDebounced();
    });
    
    // 默认音量
    $('#mp_volume_range').val(settings.volume || 50).on('input', function() {
        const v = parseInt(this.value);
        extension_settings[extensionName].volume = v;
        $('#mp_volume_val').text(v + '%');
        $('#mp_vol').val(v);
        if (audio) audio.volume = v / 100;
        saveSettingsDebounced();
    });
    $('#mp_volume_val').text((settings.volume || 50) + '%');
    
    // 登录/退出按钮
    $('#mp_netease_login').on('click', () => showQRModal('netease'));
    $('#mp_netease_logout').on('click', () => doLogout('netease'));
    $('#mp_qq_login').on('click', () => showQRModal('qq'));
    $('#mp_qq_logout').on('click', () => doLogout('qq'));
    
    // 二维码弹窗
    $('#mp_qr_close, #mp_qr_modal').on('click', function(e) {
        if (e.target === this || $(this).is('#mp_qr_close')) {
            $('#mp_qr_modal').fadeOut(200);
        }
    });
    $('.mp_qr_content').on('click', e => e.stopPropagation());
    
    // 更新登录状态
    updateLoginUI('netease');
    updateLoginUI('qq');
}

// 初始化播放器
function initPlayer() {
    const settings = extension_settings[extensionName];
    audio = new Audio();
    audio.volume = (settings.volume || 50) / 100;
    
    if (settings.visible === false) {
        $('#mp_player').hide();
    }
    
    // 播放/暂停
    $('#mp_play_btn').on('click', function() {
        if (playlist.length === 0) {
            toastr.info('请先添加音乐');
            return;
        }
        if (isPlaying) {
            audio.pause();
            $(this).text('▶');
        } else {
            audio.play();
            $(this).text('⏸');
        }
        isPlaying = !isPlaying;
    });
    
    // 上一首/下一首
    $('#mp_prev_btn').on('click', () => {
        if (playlist.length === 0) return;
        currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
        loadSong(currentIndex);
    });
    $('#mp_next_btn').on('click', () => {
        if (playlist.length === 0) return;
        currentIndex = (currentIndex + 1) % playlist.length;
        loadSong(currentIndex);
    });
    
    // 音量
    $('#mp_vol').val(settings.volume || 50).on('input', function() {
        audio.volume = this.value / 100;
    });
    
    // 播放列表切换
    $('#mp_list_btn').on('click', () => $('#mp_playlist_panel').slideToggle(200));
    
    // 最小化
    let minimized = false;
    $('#mp_min_btn').on('click', function() {
        minimized = !minimized;
        if (minimized) {
            $('#mp_now_playing, #mp_prev_btn, #mp_next_btn, #mp_vol, #mp_list_btn').hide();
            $('#mp_playlist_panel').slideUp(200);
            $(this).text('➕');
        } else {
            $('#mp_now_playing, #mp_prev_btn, #mp_next_btn, #mp_vol, #mp_list_btn').show();
            $(this).text('➖');
        }
    });
    
    // 添加音乐
    $('#mp_add_file').on('change', function() {
        const files = Array.from(this.files);
        const startIdx = playlist.length;
        files.forEach(f => {
            playlist.push({ name: f.name.replace(/\.[^/.]+$/, ''), url: URL.createObjectURL(f) });
        });
        renderPlaylist();
        if (startIdx === 0 && playlist.length > 0) loadSong(0);
        toastr.success(`已添加 ${files.length} 首歌曲`);
        this.value = '';
    });
    
    // 播放结束
    audio.addEventListener('ended', () => {
        currentIndex = (currentIndex + 1) % playlist.length;
        if (playlist.length > 0) loadSong(currentIndex);
    });
}

// 设置面板HTML - 完全按照 SillyTavern 格式
const settingsHtml = `
<div class="mp_settings">
    <div class="inline-drawer">
        <div class="inline-drawer-toggle inline-drawer-header">
            <b>🎵 迷你音乐播放器</b>
            <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
        </div>
        <div class="inline-drawer-content">
            <div class="mp_section">
                <div class="mp_section_title">☁️ 网易云音乐</div>
                <div id="mp_netease_status" class="mp_login_row">
                    <span class="mp_status_dot offline"></span>
                    <span class="mp_status_text">未登录</span>
                </div>
                <div id="mp_netease_user" class="mp_user_row" style="display:none;">
                    <img class="mp_avatar" src="">
                    <span class="mp_name"></span>
                </div>
                <div class="mp_btn_row">
                    <input id="mp_netease_login" class="menu_button" type="button" value="扫码登录">
                    <input id="mp_netease_logout" class="menu_button" type="button" value="退出登录" style="display:none;">
                </div>
            </div>
            <div class="mp_section">
                <div class="mp_section_title">🎵 QQ音乐</div>
                <div id="mp_qq_status" class="mp_login_row">
                    <span class="mp_status_dot offline"></span>
                    <span class="mp_status_text">未登录</span>
                </div>
                <div id="mp_qq_user" class="mp_user_row" style="display:none;">
                    <img class="mp_avatar" src="">
                    <span class="mp_name"></span>
                </div>
                <div class="mp_btn_row">
                    <input id="mp_qq_login" class="menu_button" type="button" value="扫码登录">
                    <input id="mp_qq_logout" class="menu_button" type="button" value="退出登录" style="display:none;">
                </div>
            </div>
            <div class="mp_section">
                <div class="mp_section_title">⚙️ 播放器设置</div>
                <label class="checkbox_label" for="mp_show_player">
                    <input id="mp_show_player" type="checkbox" checked>
                    显示播放器
                </label>
                <label class="checkbox_label" for="mp_autoplay">
                    <input id="mp_autoplay" type="checkbox">
                    自动播放
                </label>
                <div class="mp_range_row">
                    <span>默认音量</span>
                    <input id="mp_volume_range" type="range" min="0" max="100" value="50">
                    <span id="mp_volume_val">50%</span>
                </div>
            </div>
        </div>
    </div>
</div>
`;

// 二维码弹窗HTML
const qrModalHtml = `
<div id="mp_qr_modal" style="display:none;">
    <div class="mp_qr_content">
        <div class="mp_qr_header">
            <span class="mp_qr_title">扫码登录</span>
            <span id="mp_qr_close">✕</span>
        </div>
        <div class="mp_qr_body">
            <div class="mp_qr_code"></div>
            <div class="mp_qr_tip">请使用手机扫描</div>
        </div>
    </div>
</div>
`;

// 播放器HTML
const playerHtml = `
<div id="mp_player">
    <div class="mp_main">
        <div id="mp_now_playing">未选择歌曲</div>
        <div class="mp_controls">
            <button id="mp_prev_btn">⏮</button>
            <button id="mp_play_btn">▶</button>
            <button id="mp_next_btn">⏭</button>
            <input id="mp_vol" type="range" min="0" max="100" value="50">
            <button id="mp_list_btn">📁</button>
            <button id="mp_min_btn">➖</button>
        </div>
    </div>
    <div id="mp_playlist_panel" style="display:none;">
        <div class="mp_pl_header">
            <span>播放列表</span>
            <label class="menu_button mp_add_btn">
                ➕ 添加
                <input id="mp_add_file" type="file" accept="audio/*" multiple hidden>
            </label>
        </div>
        <ul id="mp_playlist_ul"></ul>
    </div>
</div>
`;

// jQuery 入口点
jQuery(async () => {
    await loadSettings();
    
    // 插入设置面板到扩展设置区域
    $("#extensions_settings").append(settingsHtml);
    
    // 插入二维码弹窗
    $("body").append(qrModalHtml);
    
    // 插入播放器
    $("body").append(playerHtml);
    
    // 初始化功能
    initSettings();
    initPlayer();
    
    console.log("[迷你音乐播放器] 加载完成");
});                <b>🎵 迷你音乐播放器</b>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
            </div>
            <div class="inline-drawer-content">
                <!-- 网易云音乐 -->
                <div class="music-section">
                    <h4>☁️ 网易云音乐</h4>
                    <div class="music-login-status" id="netease-status">
                        <span class="status-indicator offline"></span>
                        <span>未登录</span>
                    </div>
                    <div class="music-user-info" id="netease-user" style="display:none;">
                        <img class="music-avatar" src="" alt="">
                        <span class="music-username"></span>
                    </div>
                    <div class="music-btn-group">
                        <button class="menu_button" id="netease-login-btn">扫码登录</button>
                        <button class="menu_button" id="netease-logout-btn" style="display:none;">退出登录</button>
                    </div>
                </div>

                <!-- QQ音乐 -->
                <div class="music-section">
                    <h4>🎵 QQ音乐</h4>
                    <div class="music-login-status" id="qq-status">
                        <span class="status-indicator offline"></span>
                        <span>未登录</span>
                    </div>
                    <div class="music-user-info" id="qq-user" style="display:none;">
                        <img class="music-avatar" src="" alt="">
                        <span class="music-username"></span>
                    </div>
                    <div class="music-btn-group">
                        <button class="menu_button" id="qq-login-btn">扫码登录</button>
                        <button class="menu_button" id="qq-logout-btn" style="display:none;">退出登录</button>
                    </div>
                </div>

                <!-- 播放器设置 -->
                <div class="music-section">
                    <h4>⚙️ 播放器设置</h4>
                    <label class="checkbox_label">
                        <input type="checkbox" id="music-player-visible">
                        <span>显示播放器</span>
                    </label>
                    <label class="checkbox_label">
                        <input type="checkbox" id="music-player-autoplay">
                        <span>自动播放</span>
                    </label>
                    <div class="music-volume-row">
                        <span>默认音量</span>
                        <input type="range" id="music-default-volume" min="0" max="100" value="50">
                        <span id="music-volume-text">50%</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
}

// 获取播放器 HTML
function getPlayerHTML() {
    return `
    <div id="mini-music-player">
        <div class="music-player-main">
            <div class="music-player-title" id="music-now-playing">未选择歌曲</div>
            <div class="music-player-controls">
                <button id="music-prev" title="上一首">⏮</button>
                <button id="music-play" title="播放">▶</button>
                <button id="music-next" title="下一首">⏭</button>
                <input type="range" id="music-volume" min="0" max="100" value="50" title="音量">
                <button id="music-list-toggle" title="播放列表">📁</button>
                <button id="music-minimize" title="最小化">➖</button>
            </div>
        </div>
        <div id="music-playlist-panel" style="display:none;">
            <div class="music-playlist-header">
                <span>播放列表</span>
                <label class="menu_button" id="music-add-btn">
                    ➕ 添加音乐
                    <input type="file" id="music-file-input" accept="audio/*" multiple style="display:none;">
                </label>
            </div>
            <ul id="music-playlist"></ul>
        </div>
    </div>
    `;
}

// 获取二维码弹窗 HTML
function getQRModalHTML() {
    return `
    <div id="music-qr-modal" style="display:none;">
        <div class="music-qr-content">
            <div class="music-qr-header">
                <h3 id="music-qr-title">扫码登录</h3>
                <button id="music-qr-close">✕</button>
            </div>
            <div class="music-qr-body">
                <div id="music-qr-code"></div>
                <p>请使用手机APP扫描二维码</p>
                <div id="music-qr-status">点击二维码模拟登录</div>
            </div>
        </div>
    </div>
    `;
}

// 生成模拟二维码
function generateFakeQR() {
    let svg = '<svg viewBox="0 0 100 100" width="160" height="160"><rect fill="#fff" width="100" height="100"/>';
    for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 20; j++) {
            if (Math.random() > 0.5) {
                svg += `<rect x="${i*5}" y="${j*5}" width="5" height="5" fill="#000"/>`;
            }
        }
    }
    // 定位点
    svg += '<rect x="5" y="5" width="20" height="20" fill="#000"/><rect x="10" y="10" width="10" height="10" fill="#fff"/>';
    svg += '<rect x="75" y="5" width="20" height="20" fill="#000"/><rect x="80" y="10" width="10" height="10" fill="#fff"/>';
    svg += '<rect x="5" y="75" width="20" height="20" fill="#000"/><rect x="10" y="80" width="10" height="10" fill="#fff"/>';
    svg += '</svg>';
    return svg;
}

// 更新登录状态显示
function updateLoginUI(platform) {
    const settings = extension_settings[extensionName];
    const data = settings[platform];
    
    const statusEl = $(`#${platform}-status`);
    const userEl = $(`#${platform}-user`);
    const loginBtn = $(`#${platform}-login-btn`);
    const logoutBtn = $(`#${platform}-logout-btn`);
    
    if (data.loggedIn) {
        statusEl.find('.status-indicator').removeClass('offline').addClass('online');
        statusEl.find('span:last').text('已登录');
        userEl.show();
        userEl.find('.music-avatar').attr('src', data.avatar);
        userEl.find('.music-username').text(data.username);
        loginBtn.hide();
        logoutBtn.show();
    } else {
        statusEl.find('.status-indicator').removeClass('online').addClass('offline');
        statusEl.find('span:last').text('未登录');
        userEl.hide();
        loginBtn.show();
        logoutBtn.hide();
    }
}

// 显示二维码弹窗
function showQRModal(platform) {
    const names = { netease: '网易云音乐', qq: 'QQ音乐' };
    $('#music-qr-title').text(`${names[platform]} 扫码登录`);
    $('#music-qr-code').html(`<div class="qr-box">${generateFakeQR()}</div>`);
    $('#music-qr-status').text('点击二维码模拟登录');
    $('#music-qr-modal').data('platform', platform).fadeIn(200);
    
    // 点击二维码模拟登录
    $('#music-qr-code').off('click').on('click', function() {
        const p = $('#music-qr-modal').data('platform');
        $('#music-qr-status').text('登录成功！');
        
        setTimeout(() => {
            extension_settings[extensionName][p] = {
                loggedIn: true,
                username: p === 'netease' ? '网易云用户' : 'QQ音乐用户',
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${p}${Date.now()}`
            };
            saveSettingsDebounced();
            updateLoginUI(p);
            $('#music-qr-modal').fadeOut(200);
            toastr.success(`${names[p]} 登录成功！`);
        }, 800);
    });
}

// 退出登录
function logout(platform) {
    const names = { netease: '网易云音乐', qq: 'QQ音乐' };
    extension_settings[extensionName][platform] = {
        loggedIn: false,
        username: '',
        avatar: ''
    };
    saveSettingsDebounced();
    updateLoginUI(platform);
    toastr.info(`已退出 ${names[platform]}`);
}

// 加载歌曲
function loadSong(index) {
    if (playlist.length === 0) return;
    currentIndex = index;
    const song = playlist[index];
    audio.src = song.url;
    $('#music-now-playing').text(song.name);
    audio.play();
    $('#music-play').text('⏸');
    isPlaying = true;
    renderPlaylist();
}

// 渲染播放列表
function renderPlaylist() {
    const $list = $('#music-playlist');
    $list.empty();
    playlist.forEach((song, i) => {
        const $li = $(`
            <li class="${i === currentIndex ? 'active' : ''}">
                <span class="song-name">${song.name}</span>
                <button class="remove-btn" data-idx="${i}">✕</button>
            </li>
        `);
        $li.find('.song-name').on('click', () => loadSong(i));
        $li.find('.remove-btn').on('click', function(e) {
            e.stopPropagation();
            const idx = $(this).data('idx');
            URL.revokeObjectURL(playlist[idx].url);
            playlist.splice(idx, 1);
            if (playlist.length === 0) {
                audio.pause();
                audio.src = '';
                $('#music-now-playing').text('未选择歌曲');
                $('#music-play').text('▶');
                isPlaying = false;
            } else if (idx <= currentIndex) {
                currentIndex = Math.max(0, currentIndex - 1);
                if (idx === currentIndex + 1) loadSong(currentIndex);
            }
            renderPlaylist();
        });
        $list.append($li);
    });
}

// 初始化播放器功能
function initPlayerEvents() {
    audio = new Audio();
    const settings = extension_settings[extensionName];
    audio.volume = settings.volume / 100;
    
    // 播放/暂停
    $('#music-play').on('click', function() {
        if (playlist.length === 0) {
            toastr.info('请先添加音乐');
            return;
        }
        if (isPlaying) {
            audio.pause();
            $(this).text('▶');
        } else {
            audio.play();
            $(this).text('⏸');
        }
        isPlaying = !isPlaying;
    });
    
    // 上一首/下一首
    $('#music-prev').on('click', () => {
        if (playlist.length === 0) return;
        currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
        loadSong(currentIndex);
    });
    
    $('#music-next').on('click', () => {
        if (playlist.length === 0) return;
        currentIndex = (currentIndex + 1) % playlist.length;
        loadSong(currentIndex);
    });
    
    // 音量
    $('#music-volume').val(settings.volume).on('input', function() {
        audio.volume = this.value / 100;
    });
    
    // 播放列表切换
    $('#music-list-toggle').on('click', () => {
        $('#music-playlist-panel').slideToggle(200);
    });
    
    // 最小化
    let minimized = false;
    $('#music-minimize').on('click', function() {
        minimized = !minimized;
        if (minimized) {
            $('.music-player-title, #music-prev, #music-next, #music-volume, #music-list-toggle').hide();
            $('#music-playlist-panel').hide();
            $(this).text('➕');
        } else {
            $('.music-player-title, #music-prev, #music-next, #music-volume, #music-list-toggle').show();
            $(this).text('➖');
        }
    });
    
    // 添加音乐
    $('#music-file-input').on('change', function() {
        const files = Array.from(this.files);
        const startIdx = playlist.length;
        files.forEach(file => {
            playlist.push({
                name: file.name.replace(/\.[^/.]+$/, ''),
                url: URL.createObjectURL(file)
            });
        });
        renderPlaylist();
        if (startIdx === 0 && playlist.length > 0) {
            loadSong(0);
        }
        toastr.success(`已添加 ${files.length} 首歌曲`);
        this.value = '';
    });
    
    // 播放结束
    audio.addEventListener('ended', () => {
        currentIndex = (currentIndex + 1) % playlist.length;
        loadSong(currentIndex);
    });
}

// 初始化设置面板事件
function initSettingsEvents() {
    const settings = extension_settings[extensionName];
    
    // 显示播放器
    $('#music-player-visible').prop('checked', settings.visible).on('change', function() {
        settings.visible = this.checked;
        $('#mini-music-player').toggle(this.checked);
        saveSettingsDebounced();
    });
    
    // 自动播放
    $('#music-player-autoplay').prop('checked', settings.autoPlay).on('change', function() {
        settings.autoPlay = this.checked;
        saveSettingsDebounced();
    });
    
    // 默认音量
    $('#music-default-volume').val(settings.volume).on('input', function() {
        settings.volume = parseInt(this.value);
        $('#music-volume-text').text(`${this.value}%`);
        $('#music-volume').val(this.value);
        if (audio) audio.volume = this.value / 100;
        saveSettingsDebounced();
    });
    $('#music-volume-text').text(`${settings.volume}%`);
    
    // 登录按钮
    $('#netease-login-btn').on('click', () => showQRModal('netease'));
    $('#netease-logout-btn').on('click', () => logout('netease'));
    $('#qq-login-btn').on('click', () => showQRModal('qq'));
    $('#qq-logout-btn').on('click', () => logout('qq'));
    
    // 二维码弹窗关闭
    $('#music-qr-close').on('click', () => $('#music-qr-modal').fadeOut(200));
    $('#music-qr-modal').on('click', function(e) {
        if (e.target === this) $(this).fadeOut(200);
    });
    
    // 更新登录状态
    updateLoginUI('netease');
    updateLoginUI('qq');
}

// jQuery 入口
jQuery(async () => {
    loadSettings();
    
    // 添加设置面板
    $('#extensions_settings').append(getSettingsHTML());
    
    // 添加播放器
    $('body').append(getPlayerHTML());
    
    // 添加二维码弹窗
    $('body').append(getQRModalHTML());
    
    // 初始化
    initSettingsEvents();
    initPlayerEvents();
    
    // 根据设置显示/隐藏播放器
    if (!extension_settings[extensionName].visible) {
        $('#mini-music-player').hide();
    }
    
    console.log('[迷你音乐播放器] 初始化完成');
});                            <span class="user-name"></span>
                        </div>
                        <button id="netease-login-btn" class="menu_button">扫码登录</button>
                        <button id="netease-logout-btn" class="menu_button hidden">退出登录</button>
                    </div>

                    <!-- QQ音乐 -->
                    <div class="music-platform-section">
                        <h4>🎵 QQ音乐</h4>
                        <div id="qq-status" class="login-status">
                            <span class="status-dot offline"></span>
                            <span class="status-text">未登录</span>
                        </div>
                        <div id="qq-user-info" class="user-info hidden">
                            <img class="user-avatar" src="" alt="头像">
                            <span class="user-name"></span>
                        </div>
                        <button id="qq-login-btn" class="menu_button">扫码登录</button>
                        <button id="qq-logout-btn" class="menu_button hidden">退出登录</button>
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
    }

    // 二维码弹窗 HTML
    function getQRModalHTML() {
        return `
        <div id="qr-login-modal" class="qr-modal hidden">
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
                    <div id="qr-status" class="qr-status waiting">等待扫码...</div>
                </div>
            </div>
        </div>
        `;
    }

    // 播放器 HTML
    function getPlayerHTML() {
        return `
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
            <div id="playlist-panel" class="hidden">
                <div class="playlist-header">
                    <span>播放列表</span>
                    <input type="file" id="add-music" accept="audio/*" multiple style="display:none;">
                    <button id="add-music-btn">➕ 添加音乐</button>
                </div>
                <ul id="playlist-list"></ul>
            </div>
        </div>
        `;
    }

    // 加载设置
    function loadSettings() {
        try {
            const saved = localStorage.getItem("miniMusicPlayerSettings");
            if (saved) {
                const settings = JSON.parse(saved);
                loginStatus = settings.loginStatus || loginStatus;
                return settings;
            }
        } catch (e) {
            console.error("[音乐播放器] 加载设置失败:", e);
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
        try {
            settings.loginStatus = loginStatus;
            localStorage.setItem("miniMusicPlayerSettings", JSON.stringify(settings));
        } catch (e) {
            console.error("[音乐播放器] 保存设置失败:", e);
        }
    }

    // 更新登录状态UI
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
            userInfoEl.classList.remove("hidden");
            userInfoEl.querySelector(".user-avatar").src = status.avatar || "https://via.placeholder.com/32";
            userInfoEl.querySelector(".user-name").textContent = status.username;
            loginBtn.classList.add("hidden");
            logoutBtn.classList.remove("hidden");
        } else {
            statusDot.className = "status-dot offline";
            statusText.textContent = "未登录";
            userInfoEl.classList.add("hidden");
            loginBtn.classList.remove("hidden");
            logoutBtn.classList.add("hidden");
        }
    }

    // 生成二维码图案
    function generateQRPattern() {
        let pattern = "";
        const size = 5;
        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < 20; j++) {
                if (Math.random() > 0.5) {
                    pattern += `<rect x="${i * size}" y="${j * size}" width="${size}" height="${size}" fill="#000"/>`;
                }
            }
        }
        pattern += `<rect x="5" y="5" width="20" height="20" fill="#000"/>`;
        pattern += `<rect x="10" y="10" width="10" height="10" fill="#fff"/>`;
        pattern += `<rect x="75" y="5" width="20" height="20" fill="#000"/>`;
        pattern += `<rect x="80" y="10" width="10" height="10" fill="#fff"/>`;
        pattern += `<rect x="5" y="75" width="20" height="20" fill="#000"/>`;
        pattern += `<rect x="10" y="80" width="10" height="10" fill="#fff"/>`;
        return pattern;
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
        modal.classList.remove("hidden");
        modal.dataset.platform = platform;

        qrContainer.innerHTML = `
            <div class="qr-code-box">
                <svg viewBox="0 0 100 100" width="180" height="180">
                    <rect fill="#ffffff" width="100" height="100"/>
                    ${generateQRPattern()}
                </svg>
            </div>
        `;
        qrStatus.textContent = "请使用手机扫描二维码";
        qrStatus.className = "qr-status waiting";

        setTimeout(() => {
            qrStatus.textContent = "💡 提示：点击二维码模拟登录";
            qrStatus.className = "qr-status info";
        }, 1500);

        qrContainer.onclick = () => {
            qrStatus.textContent = "✓ 扫码成功，正在登录...";
            qrStatus.className = "qr-status success";
            
            setTimeout(() => {
                loginStatus[platform] = {
                    loggedIn: true,
                    username: platform === "netease" ? "网易云用户" : "QQ音乐用户",
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${platform}${Date.now()}`
                };
                
                updateLoginStatusUI(platform);
                saveSettings(loadSettings());
                modal.classList.add("hidden");
                
                if (typeof toastr !== "undefined") {
                    toastr.success(`${platformNames[platform]} 登录成功！`);
                }
            }, 1000);
        };
    }

    // 退出登录
    function logout(platform) {
        const platformNames = { netease: "网易云音乐", qq: "QQ音乐" };
        loginStatus[platform] = { loggedIn: false, username: "", avatar: "" };
        updateLoginStatusUI(platform);
        saveSettings(loadSettings());
        if (typeof toastr !== "undefined") {
            toastr.info(`已退出 ${platformNames[platform]}`);
        }
    }

    // 初始化设置面板
    function initSettingsPanel() {
        const container = document.getElementById("extensions_settings");
        if (!container) {
            console.log("[音乐播放器] 未找到设置容器，5秒后重试...");
            setTimeout(initSettingsPanel, 5000);
            return;
        }

        // 检查是否已添加
        if (document.querySelector(".music-player-settings")) {
            console.log("[音乐播放器] 设置面板已存在");
            return;
        }

        // 添加设置面板
        const settingsDiv = document.createElement("div");
        settingsDiv.innerHTML = getSettingsHTML();
        container.appendChild(settingsDiv);
        console.log("[音乐播放器] 设置面板已添加");

        // 添加二维码弹窗
        if (!document.getElementById("qr-login-modal")) {
            const modalDiv = document.createElement("div");
            modalDiv.innerHTML = getQRModalHTML();
            document.body.appendChild(modalDiv);
        }

        const settings = loadSettings();

        // 折叠面板
        const toggle = settingsDiv.querySelector(".inline-drawer-toggle");
        const content = settingsDiv.querySelector(".inline-drawer-content");
        const icon = settingsDiv.querySelector(".inline-drawer-icon");
        
        toggle.addEventListener("click", () => {
            const isHidden = content.style.display === "none";
            content.style.display = isHidden ? "block" : "none";
            icon.classList.toggle("fa-circle-chevron-up", isHidden);
            icon.classList.toggle("fa-circle-chevron-down", !isHidden);
        });

        // 登录按钮
        document.getElementById("netease-login-btn").addEventListener("click", () => showQRModal("netease"));
        document.getElementById("netease-logout-btn").addEventListener("click", () => logout("netease"));
        document.getElementById("qq-login-btn").addEventListener("click", () => showQRModal("qq"));
        document.getElementById("qq-logout-btn").addEventListener("click", () => logout("qq"));

        // 关闭弹窗
        document.getElementById("qr-modal-close").addEventListener("click", () => {
            document.getElementById("qr-login-modal").classList.add("hidden");
        });
        document.getElementById("qr-login-modal").addEventListener("click", (e) => {
            if (e.target.id === "qr-login-modal") {
                e.target.classList.add("hidden");
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

        // 音量
        const volumeSlider = document.getElementById("default-volume");
        const volumeValue = document.getElementById("volume-value");
        volumeSlider.value = settings.volume || 50;
        volumeValue.textContent = `${volumeSlider.value}%`;
        volumeSlider.addEventListener("input", (e) => {
            volumeValue.textContent = `${e.target.value}%`;
            settings.volume = parseInt(e.target.value);
            saveSettings(settings);
            const playerVolume = document.getElementById("volume-slider");
            if (playerVolume) playerVolume.value = e.target.value;
            const audio = document.getElementById("player-audio");
            if (audio) audio.volume = e.target.value / 100;
        });

        // 更新状态
        updateLoginStatusUI("netease");
        updateLoginStatusUI("qq");
    }

    // 初始化播放器
    function initPlayer() {
        if (document.getElementById("mini-music-player")) {
            console.log("[音乐播放器] 播放器已存在");
            return;
        }

        const settings = loadSettings();
        const container = document.createElement("div");
        container.innerHTML = getPlayerHTML();
        document.body.appendChild(container);
        console.log("[音乐播放器] 播放器已添加");

        const player = document.getElementById("mini-music-player");
        if (settings.visible === false) {
            player.style.display = "none";
        }

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
        const playlistEl = document.getElementById("playlist-list");
        const minimizeBtn = document.getElementById("minimize-btn");

        audio.volume = (settings.volume || 50) / 100;
        volumeSlider.value = settings.volume || 50;

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

        function renderPlaylist() {
            playlistEl.innerHTML = "";
            playlist.forEach((song, i) => {
                const li = document.createElement("li");
                li.className = i === currentIndex ? "active" : "";
                li.innerHTML = `
                    <span class="song-name">${song.name}</span>
                    <button class="remove-song" data-index="${i}">✕</button>
                `;
                li.querySelector(".song-name").addEventListener("click", () => {
                    currentIndex = i;
                    loadSong(i);
                });
                li.querySelector(".remove-song").addEventListener("click", (e) => {
                    e.stopPropagation();
                    playlist.splice(i, 1);
                    if (currentIndex >= playlist.length) currentIndex = Math.max(0, playlist.length - 1);
                    if (playlist.length === 0) {
                        audio.pause();
                        audio.src = "";
                        songTitle.textContent = "未选择歌曲";
                        playBtn.textContent = "▶";
                        isPlaying = false;
                    } else if (i === currentIndex) {
                        loadSong(currentIndex);
                    }
                    renderPlaylist();
                });
                playlistEl.appendChild(li);
            });
        }

        playBtn.addEventListener("click", () => {
            if (playlist.length === 0) {
                if (typeof toastr !== "undefined") toastr.info("请先添加音乐");
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

        prevBtn.addEventListener("click", () => {
            if (playlist.length === 0) return;
            currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
            loadSong(currentIndex);
        });

        nextBtn.addEventListener("click", () => {
            if (playlist.length === 0) return;
            currentIndex = (currentIndex + 1) % playlist.length;
            loadSong(currentIndex);
        });

        volumeSlider.addEventListener("input", (e) => {
            audio.volume = e.target.value / 100;
        });

        playlistBtn.addEventListener("click", () => {
            playlistPanel.classList.toggle("hidden");
        });

        let isMinimized = false;
        minimizeBtn.addEventListener("click", () => {
            isMinimized = !isMinimized;
            const info = player.querySelector(".player-info");
            const controls = player.querySelectorAll(".player-controls button:not(#minimize-btn), .player-controls input");
            
            if (isMinimized) {
                info.style.display = "none";
                controls.forEach(el => el.style.display = "none");
                playlistPanel.classList.add("hidden");
                minimizeBtn.textContent = "➕";
            } else {
                info.style.display = "block";
                controls.forEach(el => el.style.display = "");
                minimizeBtn.textContent = "➖";
            }
        });

        addMusicBtn.addEventListener("click", () => addMusicInput.click());
        addMusicInput.addEventListener("change", (e) => {
            const files = Array.from(e.target.files);
            files.forEach(file => {
                playlist.push({
                    name: file.name.replace(/\.[^/.]+$/, ""),
                    url: URL.createObjectURL(file)
                });
            });
            renderPlaylist();
            if (playlist.length === files.length) loadSong(0);
            if (typeof toastr !== "undefined") toastr.success(`已添加 ${files.length} 首歌曲`);
        });

        audio.addEventListener("ended", () => {
            currentIndex = (currentIndex + 1) % playlist.length;
            loadSong(currentIndex);
        });
    }

    // 主函数
    function init() {
        console.log("[音乐播放器] 开始初始化...");
        
        // 延迟初始化，等待 SillyTavern 加载
        setTimeout(() => {
            initPlayer();
            initSettingsPanel();
            console.log("[音乐播放器] 初始化完成");
        }, 2000);
    }

    // 启动
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();                    <button id="netease-login-btn" class="menu_button">扫码登录</button>
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
