import { extension_settings } from "../../../extensions.js";
import { saveSettingsDebounced } from "../../../../script.js";

const extensionName = "music-player";
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;

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

// 加载设置
function loadSettings() {
    extension_settings[extensionName] = extension_settings[extensionName] || {};
    if (Object.keys(extension_settings[extensionName]).length === 0) {
        Object.assign(extension_settings[extensionName], defaultSettings);
    }
}

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
    $('.mp_qr_title').text(`${n[p]} 扫码登录`);
    $('#mp_qr_img').html(`<div class="mp_qr_code">${fakeQR()}</div>`);
    $('#mp_qr_tip').text('点击二维码模拟登录');
    $('#mp_qr_modal').data('platform', p).fadeIn(200);
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
        const $li = $(`<li class="${i === currentIndex ? 'active' : ''}"><span class="mp_sname">${s.name}</span><span class="mp_sdel">✕</span></li>`);
        $li.find('.mp_sname').on('click', () => playSong(i));
        $li.find('.mp_sdel').on('click', e => {
            e.stopPropagation();
            URL.revokeObjectURL(playlist[i].url);
            playlist.splice(i, 1);
            if (!playlist.length) {
                audio.pause();
                audio.src = '';
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

// 绑定事件
function bindEvents() {
    const settings = extension_settings[extensionName];
    
    // ===== 设置面板 =====
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
    
    // 登录按钮
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
        const p = $('#mp_qr_modal').data('platform');
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
    
    // 初始化登录状态
    updateLogin('netease');
    updateLogin('qq');
    
    // ===== 播放器 =====
    audio = new Audio();
    audio.volume = (settings.volume || 50) / 100;
    
    if (settings.visible === false) {
        $('#mp_player').hide();
    }
    
    $('#mp_play').on('click', function() {
        if (!playlist.length) {
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
    
    let minimized = false;
    $('#mp_min').on('click', function() {
        minimized = !minimized;
        $('#mp_song, #mp_prev, #mp_next, #mp_vol, #mp_list').toggle(!minimized);
        if (minimized) $('#mp_pl_panel').slideUp(200);
        $(this).text(minimized ? '➕' : '➖');
    });
    
    $('#mp_files').on('change', function() {
        const files = Array.from(this.files);
        const startIdx = playlist.length;
        files.forEach(f => {
            playlist.push({
                name: f.name.replace(/\.[^.]+$/, ''),
                url: URL.createObjectURL(f)
            });
        });
        renderPL();
        if (startIdx === 0 && playlist.length) playSong(0);
        toastr.success(`已添加 ${files.length} 首歌曲`);
        this.value = '';
    });
    
    audio.onended = () => {
        if (playlist.length) {
            currentIndex = (currentIndex + 1) % playlist.length;
            playSong(currentIndex);
        }
    };
}

// ========== 入口 ==========
jQuery(async () => {
    loadSettings();
    
    // 关键：使用 $.get 加载 HTML 模板，添加到 #extensions_settings2
    const settingsHtml = await $.get(`${extensionFolderPath}/settings.html`);
    $("#extensions_settings2").append(settingsHtml);
    
    // 绑定事件
    bindEvents();
    
    console.log("[迷你音乐播放器] ✓ 加载完成");
});
