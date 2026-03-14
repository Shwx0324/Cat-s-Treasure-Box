(function(){'use strict';var _id='maoProof',_ver='2.9.1',_flag=_id+'_v'+_ver,_popup=null,_busy=false,_activeStyle=null,_jq=null,_tt=null,_ok=false,_hasUpdate=false,_remoteVer='';var K={ap:_id+'_ap',wd:_id+'_wd',pt:_id+'_pt',rl:_id+'_rl',sw:_id+'_sw',rt:_id+'_rt',tp:_id+'_tp',sp:_id+'_sp',si:_id+'_si',lw:_id+'_lw',spC:_id+'_spCustom',siC:_id+'_siCustom'};var TK=_id+'_themes',LK=_id+'_logs',PK=_id+'_prompts',RK=_id+'_rlpresets',CK=_id+'_checked',BK=_id+'_backup',AK=_id+'_apipresets';var C={url:'',key:'',mdl:'',sw:false,rt:0,tp:0.3,wd:[],pt:[],rl:'',sp:'',si:'',lw:[]};var _CDN='https://testingcf.jsdelivr.net/gh/Shwx0324/Cat-s-Treasure-Box@main/%E7%8C%AB%E7%8C%AB%E5%AE%A1%E6%A0%A1%E5%99%A8.js';
    var _RAW='https://raw.githubusercontent.com/Shwx0324/Cat-s-Treasure-Box/main/%E7%8C%AB%E7%8C%AB%E5%AE%A1%E6%A0%A1%E5%99%A8.js';

    var _defSI='你是一个专业的文本润色与审校工具。\n'
+'你的工作是在用户提供的原文基础上进行修改润色：替换禁词、处理限制词和禁用句式，同时根据用户的额外指令对文本进行改写优化。\n'
+'你必须在原文的基础上修改，保留原文的情节、角色、场景和整体结构。\n'
+'严禁续写——不能在原文之后添加新的情节或段落。\n'
+'严禁删除——不能省略或跳过原文中的任何段落或情节。\n'
+'你输出的是修改后的完整文本，长度应与原文接近。';

    var _defSP='你将收到一篇完整原文，请在原文基础上进行修改后，输出修改后的完整文本。\n'
+'直接输出修改后的文本，不加任何解释、标题、代码块。\n\n'
+'【★用户额外指令（最高优先级）】\n{{EXTRA}}\n\n'
+'【修改要求】\n'
+'1. 替换所有禁词为自然的近义表达\n'
+'2. 超标的限制词替换为其他表达\n'
+'3. 禁用句式改写为其他自然表达\n'
+'4. 根据以上用户额外指令对文本进行润色改写\n'
+'5. 如果用户没有额外指令，则只做禁词/限制词/句式的替换\n\n'
+'【必须遵守】\n'
+'- 在原文基础上修改，保留原文所有情节、角色、场景、对话\n'
+'- 严禁续写：不能在原文末尾之后添加任何新内容\n'
+'- 严禁删除：不能省略、跳过、删掉原文中的任何段落或情节\n'
+'- 严禁缩写：不能把原文压缩概括\n'
+'- 输出的文本长度应与原文接近\n\n'
+'【必须完整保留的内容（一字不改）】\n'
+'- 状态栏、XML标签及内容：<状态栏>...</状态栏>、<小剧场>...</小剧场>、<内心>...</内心>等\n'
+'- {{char}}、{{user}}等变量标签\n'
+'- [场景]、[旁白]等方括号标签\n'
+'- *动作描写*（星号包裹的内容）\n'
+'- 分隔线、特殊符号行\n'
+'- 所有换行符、空行的大致格式\n\n'
+'【严禁增删任何形式的标签或标记】\n'
+'- 严禁添加原文中不存在的任何标签，包括但不限于：XML标签<>、方括号标签[]、花括号标签{{}}、星号标记**等\n'
+'- 严禁删除原文中已有的任何标签\n'
+'- 严禁添加[incipere]、[finire]、[begin]、[end]、[scene]等原文没有的标记\n'
+'- 严禁添加<br>、<p>、<div>等HTML标签（除非原文已有）\n'
+'- 输出内容中所有标签的种类、数量、位置必须与原文保持一致\n'
+'- 如果不确定是否该加标签，就不要加\n\n'
+'【禁词列表】替换为近义表达：\n{{WORDS}}\n\n'
+'【限制词列表】超出次数的替换：\n{{LIMITS}}\n\n'
+'【禁用句式】改写为其他表达：\n{{PATTERNS}}';

    var _P='#'+_id+'-popup';
    var _presets=[
        {name:'❄️蓝白毛玻璃',css:'dialog[open]:has('+_P+'){background:rgba(240,246,255,0.75)!important;backdrop-filter:blur(24px)!important;-webkit-backdrop-filter:blur(24px)!important;border:1px solid rgba(255,255,255,0.45)!important;border-radius:20px!important;box-shadow:0 8px 32px rgba(100,140,220,0.18)!important}\n'+_P+' .mp-card{background:rgba(255,255,255,0.45)!important;border:1px solid rgba(255,255,255,0.55)!important}\n'+_P+' .mp-topbar{background:rgba(255,255,255,0.35)!important}\n'+_P+' .mp-b1,'+_P+' .mp-b-go{background:linear-gradient(135deg,#5b8def,#818cf8)!important}\n'+_P+' .mp-t1{background:linear-gradient(135deg,#5b8def,#a78bfa)!important;-webkit-background-clip:text!important;-webkit-text-fill-color:transparent!important}\n'+_P+' .mp-tab.active{color:#5b8def!important;border-bottom-color:#5b8def!important}\n'+_P+' .mp-tabs{border-bottom-color:rgba(255,255,255,0.3)!important}\n'+_P+' .mp-count{color:#5b8def!important}\n'+_P+' .mp-in,'+_P+' .mp-ta{color:#1e3a5f!important;background:rgba(255,255,255,0.7)!important}\n'+_P+' .mp-lb{color:#2d4a7c!important}\n'+_P+' .mp-card-title{color:#1e3a5f!important}\n'+_P+' .mp-nt{color:#4a6fa5!important}\n'+_P+' .mp-topbar label{color:#1e3a5f!important}\n'+_P+' .mp-t2{color:#4a6fa5!important}'},
        {name:'🌙暗夜紫',css:'dialog[open]:has('+_P+'){background:rgba(30,20,50,0.88)!important;backdrop-filter:blur(20px)!important;border:1px solid rgba(139,92,246,0.3)!important;border-radius:18px!important}\n'+_P+'{color:#e2d9f3!important}\n'+_P+' .mp-card{background:rgba(60,40,90,0.5)!important;border-color:rgba(139,92,246,0.2)!important}\n'+_P+' .mp-topbar{background:rgba(50,30,75,0.5)!important}\n'+_P+' .mp-in,'+_P+' .mp-ta{background:rgba(40,25,65,0.6)!important;color:#e2d9f3!important;border-color:rgba(139,92,246,0.2)!important}\n'+_P+' .mp-b1,'+_P+' .mp-b-go{background:linear-gradient(135deg,#7c3aed,#a78bfa)!important}\n'+_P+' .mp-t1{background:linear-gradient(135deg,#a78bfa,#c084fc)!important;-webkit-background-clip:text!important;-webkit-text-fill-color:transparent!important}\n'+_P+' .mp-tab{color:#8b7faa!important}\n'+_P+' .mp-tab.active{color:#c084fc!important;border-bottom-color:#c084fc!important}\n'+_P+' .mp-tabs{border-bottom-color:rgba(139,92,246,0.2)!important}\n'+_P+' .mp-lb,'+_P+' .mp-card-title{color:#c4b5fd!important}\n'+_P+' .mp-nt,'+_P+' .mp-cr{color:#8b7faa!important}\n'+_P+' .mp-pill-on{background:rgba(139,92,246,0.3)!important;color:#c084fc!important}\n'+_P+' .mp-pill-off{background:rgba(100,60,150,0.2)!important;color:#8b7faa!important}\n'+_P+' .mp-b2{background:rgba(60,40,90,0.5)!important;color:#c4b5fd!important;border-color:rgba(139,92,246,0.2)!important}\n'+_P+' .mp-count{color:#c084fc!important}\n'+_P+' .mp-logtime{color:#8b7faa!important}\n'+_P+' .mp-topbar label{color:#e2d9f3!important}\n'+_P+' .mp-t2{color:#8b7faa!important}'},
        {name:'🌿森林绿',css:'dialog[open]:has('+_P+'){background:rgba(236,253,245,0.78)!important;backdrop-filter:blur(22px)!important;border:1px solid rgba(52,211,153,0.3)!important;border-radius:20px!important}\n'+_P+' .mp-card{background:rgba(255,255,255,0.5)!important;border-color:rgba(52,211,153,0.3)!important}\n'+_P+' .mp-topbar{background:rgba(209,250,229,0.4)!important}\n'+_P+' .mp-b1,'+_P+' .mp-b-go{background:linear-gradient(135deg,#10b981,#34d399)!important}\n'+_P+' .mp-t1{background:linear-gradient(135deg,#059669,#10b981)!important;-webkit-background-clip:text!important;-webkit-text-fill-color:transparent!important}\n'+_P+' .mp-tab.active{color:#059669!important;border-bottom-color:#059669!important}\n'+_P+' .mp-count{color:#059669!important}\n'+_P+' .mp-in,'+_P+' .mp-ta{color:#134e4a!important;background:rgba(255,255,255,0.7)!important}\n'+_P+' .mp-lb{color:#166534!important}\n'+_P+' .mp-card-title{color:#134e4a!important}\n'+_P+' .mp-nt{color:#15803d!important}\n'+_P+' .mp-topbar label{color:#134e4a!important}\n'+_P+' .mp-t2{color:#15803d!important}'},
        {name:'🌸樱花粉',css:'dialog[open]:has('+_P+'){background:rgba(255,241,248,0.78)!important;backdrop-filter:blur(22px)!important;border:1px solid rgba(244,114,182,0.3)!important;border-radius:20px!important}\n'+_P+' .mp-card{background:rgba(255,255,255,0.5)!important;border-color:rgba(244,114,182,0.25)!important}\n'+_P+' .mp-topbar{background:rgba(252,231,243,0.4)!important}\n'+_P+' .mp-b1,'+_P+' .mp-b-go{background:linear-gradient(135deg,#ec4899,#f472b6)!important}\n'+_P+' .mp-t1{background:linear-gradient(135deg,#db2777,#ec4899)!important;-webkit-background-clip:text!important;-webkit-text-fill-color:transparent!important}\n'+_P+' .mp-tab.active{color:#ec4899!important;border-bottom-color:#ec4899!important}\n'+_P+' .mp-count{color:#ec4899!important}\n'+_P+' .mp-in,'+_P+' .mp-ta{color:#831843!important;background:rgba(255,255,255,0.7)!important}\n'+_P+' .mp-lb{color:#9d174d!important}\n'+_P+' .mp-card-title{color:#831843!important}\n'+_P+' .mp-nt{color:#be185d!important}\n'+_P+' .mp-topbar label{color:#831843!important}\n'+_P+' .mp-t2{color:#be185d!important}'}];function _loadLogs(){try{var r=localStorage.getItem(LK);if(r)return JSON.parse(r);}catch(x){}return[];}
    function _saveLogs(a){try{localStorage.setItem(LK,JSON.stringify(a.slice(-100)));}catch(x){}}
    function _addLog(fixes){var logs=_loadLogs(),now=new Date();var ts=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0')+' '+String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0')+':'+String(now.getSeconds()).padStart(2,'0');logs.push({ts:ts,fl:fixes});_saveLogs(logs);}
    function _parseLW(text){var arr=[];text.split('\n').forEach(function(line){line=line.trim();if(!line)return;var parts=line.split('|');var w=parts[0].trim();var n=parts.length>1?parseInt(parts[1]):1;if(w&&!isNaN(n)&&n>=0)arr.push({w:w,n:n});});return arr;}
    function _lwToText(arr){return arr.map(function(x){return x.w+'|'+x.n;}).join('\n');}
    function _countWord(txt,word){var count=0,pos=0;while((pos=txt.indexOf(word,pos))!==-1){count++;pos+=word.length;}return count;}
    function _checkLimits(txt){var over=[];C.lw.forEach(function(item){var count=_countWord(txt,item.w);if(count>item.n)over.push({w:item.w,max:item.n,actual:count,excess:count-item.n});});return over;}
    function _e(s){return typeof s!=='string'?'':s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
    function _msg(t,m,o){if(_tt)_tt[t](m,'猫猫审校',o||{});}
    function _loadPT(){try{var r=localStorage.getItem(PK);if(r)return JSON.parse(r);}catch(x){}return{list:[],active:''};}
    function _savePT(d){try{localStorage.setItem(PK,JSON.stringify(d));}catch(x){}}
    function _loadRL(){try{var r=localStorage.getItem(RK);if(r)return JSON.parse(r);}catch(x){}return{list:[],active:''};}
    function _saveRL(d){try{localStorage.setItem(RK,JSON.stringify(d));}catch(x){}}
    function _loadAP(){try{var r=localStorage.getItem(AK);if(r)return JSON.parse(r);}catch(x){}return{list:[],active:''};}
    function _saveAP(d){try{localStorage.setItem(AK,JSON.stringify(d));}catch(x){}}
    function _refreshAPSel(){if(!_popup)return;var ad=_loadAP();var $s=_popup.find('#mp-apsel');$s.empty().append('<option value="">— 选择预设 —</option>');ad.list.forEach(function(p){$s.append('<option value="'+_e(p.name)+'"'+(p.name===ad.active?' selected':'')+'>'+_e(p.name)+'</option>');});}
    function _hash(s){var h=0;for(var i=0;i<s.length;i++){h=((h<<5)-h)+s.charCodeAt(i);h|=0;}return String(h);}
    function _msgKey(idx,txt){return idx+':'+_hash((txt||'').substring(0,200));}
    function _loadChecked(){try{var r=localStorage.getItem(CK);if(r)return JSON.parse(r);}catch(x){}return[];}
    function _saveChecked(a){try{localStorage.setItem(CK,JSON.stringify(a.slice(-20)));}catch(x){}}
    function _isChecked(idx,txt){return _loadChecked().indexOf(_msgKey(idx,txt))>=0;}
    function _markChecked(idx,txt){var list=_loadChecked();var key=_msgKey(idx,txt);if(list.indexOf(key)<0){list.push(key);_saveChecked(list);}}
    function _saveBackup(idx,text){try{localStorage.setItem(BK,JSON.stringify({idx:idx,text:text,ts:Date.now()}));}catch(x){}}
    function _loadBackup(){try{var r=localStorage.getItem(BK);if(r)return JSON.parse(r);}catch(x){}return null;}
    function _clearBackup(){try{localStorage.removeItem(BK);}catch(x){}}
    function _extractTags(txt){var tags=[];var re=/<([^\/>\s]+)[^>]*>[\s\S]*?<\/\1>/g;var m;while((m=re.exec(txt))!==null){tags.push({tag:m[1],full:m[0]});}return tags;}
    function _cmpVer(a,b){var pa=a.split('.').map(Number),pb=b.split('.').map(Number);for(var i=0;i<Math.max(pa.length,pb.length);i++){var na=pa[i]||0,nb=pb[i]||0;if(nb>na)return 1;if(na>nb)return-1;}return 0;}
    function _silentCheck(){var urls=[_RAW,_CDN];function tryFetch(i){if(i>=urls.length)return;fetch(urls[i]+'?t='+Date.now()).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.text();}).then(function(code){if(!code)return;var m=code.match(/_ver='([^']+)'/);if(!m)return;var rv=m[1];if(_cmpVer(_ver,rv)>0){console.log('[猫猫审校]发现新版本 v'+rv+'，尝试自动更新…');try{eval(code);_hasUpdate=false;_remoteVer='';_hideDot();_msg('success','✅ 已自动更新到v'+rv+'，请关闭面板重新打开',{timeOut:6000});}catch(ex){console.warn('[猫猫审校]自动更新失败',ex);_hasUpdate=true;_remoteVer=rv;_showDot();_msg('warning','⚠️ 发现v'+rv+'，自动更新失败，请手动更新',{timeOut:5000});}}else{_hasUpdate=false;_remoteVer='';_hideDot();}}).catch(function(){tryFetch(i+1);});}tryFetch(0);}
    function _fetchUpdate(){var urls=[_RAW,_CDN];function tryFetch(i){if(i>=urls.length){_msg('error','所有更新源均不可用',{timeOut:3000});return Promise.reject();}return fetch(urls[i]+'?t='+Date.now()).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.text();}).catch(function(){return tryFetch(i+1);});}return tryFetch(0);}
    function _getPJQ(){var pw;try{pw=window.parent||window;}catch(x){pw=window;}return pw.jQuery||pw.$||_jq;}
    function _showDot(){var pJQ=_getPJQ();if(!pJQ)return;pJQ('#'+_id+'-updot').show();}
    function _hideDot(){var pJQ=_getPJQ();if(!pJQ)return;pJQ('#'+_id+'-updot').hide();}

    function _validateResult(orig,result){
        var origLen=orig.replace(/\s+/g,'').length;var resLen=result.replace(/\s+/g,'').length;
        if(origLen===0)return{ok:true};var ratio=resLen/origLen;
        if(ratio<0.2)return{ok:false,reason:'返回文本过短('+Math.round(ratio*100)+'%)，疑似删除原文，请检查API模型是否正常'};
        if(ratio>2.5)return{ok:false,reason:'返回文本过长('+Math.round(ratio*100)+'%)，疑似续写了新内容'};
        var origParas=orig.split(/\n\s*\n/).filter(function(p){return p.trim();});
        var resParas=result.split(/\n\s*\n/).filter(function(p){return p.trim();});
        if(origParas.length>=5&&resParas.length<origParas.length*0.3){return{ok:false,reason:'段落数从'+origParas.length+'减少到'+resParas.length+'，疑似删减了大量内容'};}
        var origTags=_extractTags(orig);
        for(var i=0;i<origTags.length;i++){var tagName=origTags[i].tag;var reCheck=new RegExp('<'+tagName+'[^>]*>[\\s\\S]*?<\\/'+tagName+'>');if(!reCheck.test(result)){console.warn('[猫猫审校]原文标签<'+tagName+'>在结果中未找到，但不拦截');}}
        var knownBad=['incipere','finire','begin','end','start','finish','note','comment','edit','revision'];
        var reBadBracket=/\[([^\]]+)\]/g;var m;var badFound=[];
        while((m=reBadBracket.exec(result))!==null){var tag=m[1].toLowerCase().trim();if(knownBad.indexOf(tag)>=0&&orig.indexOf(m[0])<0){badFound.push('['+m[1]+']');}}
        if(badFound.length>0){return{ok:false,reason:'AI添加了无关标记: '+badFound.join('、')+'，已拦截并保留原文'};}
        return{ok:true};
    }

    function _l(){try{var a=JSON.parse(localStorage.getItem(K.ap)||'{}');if(a.u)C.url=a.u;if(a.k)C.key=a.k;if(a.m)C.mdl=a.m;var w=JSON.parse(localStorage.getItem(K.wd)||'null');if(Array.isArray(w))C.wd=w;var p=JSON.parse(localStorage.getItem(K.pt)||'null');if(Array.isArray(p))C.pt=p;var r=localStorage.getItem(K.rl);if(r!==null)C.rl=r;var s=localStorage.getItem(K.sw);if(s!==null)C.sw=s==='true';var t=localStorage.getItem(K.rt);if(t!==null)C.rt=parseInt(t)||0;var e=localStorage.getItem(K.tp);if(e!==null)C.tp=parseFloat(e)||0.3;if(localStorage.getItem(K.spC)==='true'){var sp=localStorage.getItem(K.sp);C.sp=(sp&&sp.trim())?sp:_defSP;}else{C.sp=_defSP;}if(localStorage.getItem(K.siC)==='true'){var si=localStorage.getItem(K.si);C.si=(si&&si.trim())?si:_defSI;}else{C.si=_defSI;}var lw=localStorage.getItem(K.lw);if(lw){try{C.lw=JSON.parse(lw);}catch(x){C.lw=[];}}}catch(x){C.sp=_defSP;C.si=_defSI;}}
    function _s(){try{localStorage.setItem(K.ap,JSON.stringify({u:C.url,k:C.key,m:C.mdl}));localStorage.setItem(K.wd,JSON.stringify(C.wd));localStorage.setItem(K.pt,JSON.stringify(C.pt));localStorage.setItem(K.rl,C.rl);localStorage.setItem(K.sw,String(C.sw));localStorage.setItem(K.rt,String(C.rt));localStorage.setItem(K.tp,String(C.tp));localStorage.setItem(K.sp,C.sp);localStorage.setItem(K.si,C.si);localStorage.setItem(K.lw,JSON.stringify(C.lw));}catch(x){}}
    function _loadTh(){try{var r=localStorage.getItem(TK);if(r)return JSON.parse(r);}catch(x){}return{list:[],active:''};}
    function _saveTh(d){try{localStorage.setItem(TK,JSON.stringify(d));}catch(x){}}
    function _applyCSS(css){if(_activeStyle&&_activeStyle.parentNode){_activeStyle.parentNode.removeChild(_activeStyle);_activeStyle=null;}if(!css||!css.trim())return;var doc=(window.parent||window).document;var el=doc.createElement('style');el.setAttribute('data-mao-theme','1');el.textContent=css;doc.head.appendChild(el);_activeStyle=el;}
    function _initTheme(){var td=_loadTh();if(td.active){var all=_presets.concat(td.list);var f=all.find(function(t){return t.name===td.active;});if(f)_applyCSS(f.css);}}
    function _ctx(){var w=(typeof window.parent!=='undefined')?window.parent:window;var st=(typeof SillyTavern!=='undefined')?SillyTavern:(w.SillyTavern||null);if(st&&typeof st.getContext==='function')return st.getContext();if(st&&st.context)return st.context;return null;}
    function _sysP(overInfo){var wl=C.wd.filter(function(x){return x.trim();});var ws=wl.length>0?wl.join('、'):'（无）';var ls='（无）';if(C.lw.length>0)ls=C.lw.map(function(x){return'「'+x.w+'」最多'+x.n+'次';}).join('、');var pl=C.pt.filter(function(x){return x.trim();});var ps=pl.length>0?pl.join('\n'):'（无）';var extraParts=[];if(C.rl&&C.rl.trim())extraParts.push(C.rl.trim());if(overInfo)extraParts.push(overInfo);var extra=extraParts.length>0?extraParts.join('\n\n'):'（无）';var work=C.sp||_defSP;work=work.replace(/\{\{WORDS\}\}/g,ws).replace(/\{\{LIMITS\}\}/g,ls).replace(/\{\{PATTERNS\}\}/g,ps).replace(/\{\{EXTRA\}\}/g,extra);var identity=C.si||'';if(identity.trim())return identity.trim()+'\n\n'+work;return work;}
    function _ep(){var u=C.url.trim();if(!u)throw new Error('无API地址');if(u.charAt(u.length-1)!=='/')u+='/';if(u.indexOf('googleapis.com')>=0){if(u.indexOf('chat/completions')<0)u+='chat/completions';}else{if(u.indexOf('/chat/completions')<0)u+=(u.indexOf('/v1/')>=0?'':'v1/')+'chat/completions';}return u;}
    function _clean(raw){var s=raw.trim();var m=s.match(/^```[\s\S]*?\n([\s\S]*?)\n```$/);if(m)s=m[1];s=s.replace(/^---[^\n]*---\n?/,'').replace(/\n?---[^\n]*---$/,'');if((s.charAt(0)==='"'&&s.charAt(s.length-1)==='"')||(s.charAt(0)==="'"&&s.charAt(s.length-1)==="'"))s=s.substring(1,s.length-1);s=s.replace(/^\n+/,'').replace(/\n+$/,'');return s;}

    async function _call(txt,overInfo){
        if(!C.url)throw new Error('未配置API地址，请在「接口」页填写');
        if(!C.mdl)throw new Error('未选择模型，请在「接口」页加载并选择模型');
        try{var ping=await fetch(_ep(),{method:'OPTIONS',signal:AbortSignal.timeout(8000)});} catch(e){
            try{await fetch(C.url.trim(),{method:'HEAD',signal:AbortSignal.timeout(8000)});}catch(e2){
                throw new Error('无法连接到API服务器，请检查：\n1. API地址是否正确\n2. 网络/代理是否正常\n3. API服务是否在线');
            }
        }
        var h={'Content-Type':'application/json'};if(C.key)h['Authorization']='Bearer '+C.key;        var sys=_sysP(overInfo);
        var userMsg='以下是需要审校修改的原文（共'+txt.length+'字）。\n请在原文基础上进行修改，替换禁词/限制词/禁用句式，并按照指令润色。\n输出修改后的完整文本，不能续写也不能删减原文内容。\n\n---原文开始---\n'+txt+'\n---原文结束---';
        var r,body=JSON.stringify({model:C.mdl,temperature:C.tp,stream:false,messages:[{role:'system',content:sys},{role:'user',content:userMsg}]});
        var maxRetry=3,lastErr='';
        for(var _ri=0;_ri<maxRetry;_ri++){
            try{
                var ctrl=new AbortController();
                var tid=setTimeout(function(){ctrl.abort();},60000);
                r=await fetch(_ep(),{method:'POST',headers:h,body:body,signal:ctrl.signal});
                clearTimeout(tid);
                break;
            }catch(e){
                lastErr=e.message;
                if(e.name==='AbortError')lastErr='请求超时(60秒)';
                if(_ri<maxRetry-1){await new Promise(function(ok){setTimeout(ok,2000*(_ri+1));});}
                else{throw new Error('网络请求失败(重试'+maxRetry+'次): '+lastErr+'，请检查API地址和网络');}
            }
        }
        if(r.status===401)throw new Error('API认证失败(401)，请检查API Key是否正确');
        if(r.status===403)throw new Error('API拒绝访问(403)，请检查API Key权限');
        if(r.status===404)throw new Error('API地址错误(404)，请检查地址和模型名称');
        if(r.status===429)throw new Error('API请求过于频繁(429)，请稍后再试');
        if(r.status>=500)throw new Error('API服务端错误('+r.status+')，请稍后再试或更换模型');
        if(!r.ok){var errBody='';try{var ej=await r.json();errBody=ej.error&&ej.error.message?ej.error.message:JSON.stringify(ej);}catch(x){errBody=r.statusText;}throw new Error('API错误('+r.status+'): '+errBody);}
        var j;try{j=await r.json();}catch(e){throw new Error('API返回的不是有效JSON，可能API地址不正确');}
        var c=j&&j.choices&&j.choices[0]&&j.choices[0].message?j.choices[0].message.content:null;
        if(!c||!c.trim()){var finishReason=j&&j.choices&&j.choices[0]?j.choices[0].finish_reason:'';if(finishReason==='length')throw new Error('API返回为空(finish_reason=length)，模型输出被截断，请增大max_tokens或缩短原文');if(finishReason==='content_filter')throw new Error('API返回为空(content_filter)，内容被安全过滤器拦截');throw new Error('API返回空内容(finish_reason='+(finishReason||'未知')+')，请检查模型是否正常');}
        var cleaned=_clean(c);
        if(cleaned.length<5)throw new Error('API返回内容过短('+cleaned.length+'字)，可能模型未正确理解指令');
        var v=_validateResult(txt,cleaned);
        if(!v.ok){console.warn('[猫猫审校]拦截: '+v.reason);return{changed:false,text:'',fixes:[],rejected:true,reason:v.reason};}
        if(cleaned.replace(/\s+/g,'')===txt.replace(/\s+/g,''))return{changed:false,text:'',fixes:[]};
        var fixes=[];C.wd.forEach(function(w){w=w.trim();if(!w)return;if(txt.indexOf(w)>=0&&cleaned.indexOf(w)<0)fixes.push({s:w,d:'(已替换)',r:'禁词'});});C.lw.forEach(function(item){var before=_countWord(txt,item.w);var after=_countWord(cleaned,item.w);if(before>item.n&&after<before)fixes.push({s:item.w+'('+before+'→'+after+')',d:'限'+item.n+'次',r:'限制词'});});if(fixes.length===0&&cleaned!==txt)fixes.push({s:'(润色改写)',d:'按指令修改',r:'改写'});return{changed:true,text:cleaned,fixes:fixes};
    }

    async function _models(){var u=C.url.trim();if(!u)throw new Error('填写API地址');if(u.charAt(u.length-1)!=='/')u+='/';if(u.indexOf('googleapis.com')>=0){if(u.indexOf('models')<0)u+='models';}else{if(u.indexOf('models')<0)u+=(u.indexOf('/v1/')>=0?'':'v1/')+'models';}var h={'Content-Type':'application/json'};if(C.key)h['Authorization']='Bearer '+C.key;var r=await fetch(u,{method:'GET',headers:h});if(!r.ok)throw new Error(''+r.status);var d=await r.json();if(d&&d.data&&Array.isArray(d.data))return d.data.map(function(m){return m.id;}).filter(Boolean);if(Array.isArray(d))return d.map(function(m){return typeof m==='string'?m:m.id;}).filter(Boolean);return[];}
    function _findLastAI(){var ctx=_ctx();if(!ctx||!ctx.chat||!ctx.chat.length)return-1;for(var i=ctx.chat.length-1;i>=0;i--){var m=ctx.chat[i];if(m&&!m.is_user&&!m.is_system)return i;}return-1;}
    function _unveil(idx){if(!_jq)return;var $m=_jq('.mes[mesid="'+idx+'"]');if(!$m.length)return;$m.find('.mes_text').css({'filter':'none','pointer-events':'','user-select':''});$m.find('.mp-checking').remove();}
    function _veil(idx){if(!_jq)return;var $m=_jq('.mes[mesid="'+idx+'"]');if(!$m.length)return;var $t=$m.find('.mes_text');$t.css({'filter':'blur(8px)','pointer-events':'none','user-select':'none','transition':'filter .3s'});if(!$m.find('.mp-checking').length)$t.parent().append('<div class="mp-checking" style="text-align:center;padding:8px;font-size:0.85rem;color:#7c3aed;font-weight:600">🔍审校中…</div>');}
    async function _applyResult(ctx,idx,msgData,newText){ctx.chat[idx].mes=newText;var saved=false;try{if(ctx.saveChatConditional){await ctx.saveChatConditional();saved=true;}}catch(x){console.log('[猫猫审校]saveChatConditional失败',x);}if(!saved){try{if(ctx.saveChat){await ctx.saveChat();saved=true;}}catch(x){console.log('[猫猫审校]saveChat失败',x);}}if(!saved){try{if(ctx.executeSlashCommands){await ctx.executeSlashCommands('/savechat');saved=true;}}catch(x){}}var reloaded=false;var pw=(window.parent||window);try{if(pw.reloadCurrentChat){await pw.reloadCurrentChat();reloaded=true;}}catch(x){console.log('[猫猫审校]reloadChat(pw)失败',x);}if(!reloaded){try{if(ctx.reloadCurrentChat){await ctx.reloadCurrentChat();reloaded=true;}}catch(x){console.log('[猫猫审校]reloadChat(ctx)失败',x);}}if(!reloaded){var $txt=_jq('.mes[mesid="'+idx+'"] .mes_text');if($txt.length){var fmtDone=false;try{if(ctx.messageFormatting){$txt.html(ctx.messageFormatting(newText,msgData.name,false,false,idx));fmtDone=true;}}catch(x){}if(!fmtDone){try{if(pw.messageFormatting){$txt.html(pw.messageFormatting(newText,msgData.name,false,false,idx));fmtDone=true;}}catch(x){}}if(!fmtDone)$txt.html(newText.replace(/\n/g,'<br>'));}}}

    async function _doCheck(idx,force){if(_busy)return;if(!C.url||!C.mdl){_unveil(idx);return;}var hasRules=C.wd.some(function(x){return x.trim();})||C.lw.length>0||(C.rl&&C.rl.trim())||C.pt.some(function(x){return x.trim();});if(!hasRules){_unveil(idx);return;}var ctx=_ctx();if(!ctx||!ctx.chat||!ctx.chat[idx]){_msg('error','无法获取聊天数据，请确认已打开聊天');_unveil(idx);return;}var msgData=ctx.chat[idx];var orig=msgData.mes||msgData.message||'';if(msgData.is_user||msgData.is_system||!orig||orig.trim().length<2){_unveil(idx);return;}if(!force&&_isChecked(idx,orig)){_unveil(idx);return;}_busy=true;var currentText=orig;var allFixes=[];var maxRounds=1+(C.rt||0);try{for(var round=0;round<maxRounds;round++){var ol=_checkLimits(currentText);var overInfo='';if(ol.length>0){overInfo='以下限制用词超标：\n';ol.forEach(function(o){overInfo+='「'+o.w+'」限'+o.max+'次，实际'+o.actual+'次，需减少'+o.excess+'处\n';});}var hw=C.wd.some(function(w){return w.trim()&&currentText.indexOf(w.trim())>=0;});if(!hw&&ol.length===0&&round>0)break;var res=await _call(currentText,overInfo||null);if(res.rejected){_msg('warning','⚠️ '+res.reason,{timeOut:6000});break;}if(res.changed&&res.text){currentText=res.text;allFixes=allFixes.concat(res.fixes);}else break;}if(currentText!==orig&&allFixes.length>0){_saveBackup(idx,orig);_addLog(allFixes);await _applyResult(ctx,idx,msgData,currentText);_markChecked(idx,currentText);var brief=allFixes.slice(0,3).map(function(f){return'「'+f.s+'」';}).join('、');if(allFixes.length>3)brief+='…等'+allFixes.length+'处';_msg('success','✅ '+brief+(maxRounds>1?' ('+maxRounds+'轮)':''),{timeOut:4000});if(_popup)_refreshLog();}else if(currentText!==orig){_saveBackup(idx,orig);await _applyResult(ctx,idx,msgData,currentText);_markChecked(idx,currentText);_msg('success','✅ 已修正',{timeOut:2000});}else{_markChecked(idx,orig);if(force)_msg('success','✅ 无需修正',{timeOut:1500});}}catch(e){_msg('error','❌ 审校失败: '+e.message,{timeOut:8000});console.error('[猫猫审校]审校失败详情:',e);console.error('[猫猫审校]当前配置: URL='+C.url+'模型='+C.mdl+' 温度='+C.tp);}finally{_busy=false;_unveil(idx);}}
    function _refreshLog(){if(!_popup)return;var logs=_loadLogs();var $box=_popup.find('#mp-logbox');if(!$box.length)return;if(!logs.length){$box.html('<div class="mp-nt" style="text-align:center;padding:20px">暂无记录</div>');return;}var h='';for(var i=logs.length-1;i>=0;i--){var log=logs[i];h+='<div class="mp-logitem"><div class="mp-logtime">'+_e(log.ts)+' · '+log.fl.length+'处</div>';log.fl.forEach(function(f){h+='<div class="mp-logfix"><span class="mp-logold">'+_e(f.s||'')+'</span><span class="mp-logarrow">→</span><span class="mp-lognew">'+_e(f.d||'')+'</span>';if(f.r)h+='<span class="mp-logreason">('+_e(f.r)+')</span>';h+='</div>';});h+='</div>';}$box.html(h);}
    function _refreshPTSel(){if(!_popup)return;var pd=_loadPT();var $s=_popup.find('#mp-ptsel');$s.empty().append('<option value="">— 选择预设 —</option>');pd.list.forEach(function(p){$s.append('<option value="'+_e(p.name)+'"'+(p.name===pd.active?' selected':'')+'>'+_e(p.name)+'</option>');});}
    function _refreshRLSel(){if(!_popup)return;var rd=_loadRL();var $s=_popup.find('#mp-rlsel');$s.empty().append('<option value="">— 选择预设 —</option>');rd.list.forEach(function(p){$s.append('<option value="'+_e(p.name)+'"'+(p.name===rd.active?' selected':'')+'>'+_e(p.name)+'</option>');});}

    async function _openUI(){
        if(!_ok){var ctx0=_ctx();if(ctx0&&ctx0.chat){_ok=true;}else{_msg('error','请先打开一个聊天');return;}}_l();
        var td=_loadTh();var allTh=_presets.concat(td.list);var thOpts='<option value="">— 选择—</option>';allTh.forEach(function(t){thOpts+='<option value="'+_e(t.name)+'"'+(t.name===td.active?' selected':'')+'>'+_e(t.name)+'</option>';});var curCSS='';if(td.active){var ff=allTh.find(function(t){return t.name===td.active;});if(ff)curCSS=ff.css;}
        var pd=_loadPT();var ptOpts='<option value="">— 选择预设 —</option>';pd.list.forEach(function(p){ptOpts+='<option value="'+_e(p.name)+'"'+(p.name===pd.active?' selected':'')+'>'+_e(p.name)+'</option>';});
        var rd=_loadRL();var rlOpts='<option value="">— 选择预设 —</option>';rd.list.forEach(function(p){rlOpts+='<option value="'+_e(p.name)+'"'+(p.name===rd.active?' selected':'')+'>'+_e(p.name)+'</option>';});
        var ad=_loadAP();var apOpts='<option value="">— 选择预设 —</option>';ad.list.forEach(function(p){apOpts+='<option value="'+_e(p.name)+'"'+(p.name===ad.active?' selected':'')+'>'+_e(p.name)+'</option>';});
        var spIsCustom=localStorage.getItem(K.spC)==='true';var siIsCustom=localStorage.getItem(K.siC)==='true';
        var ctx=_ctx();var popupFn=null,popupType=null;
        if(ctx&&ctx.callGenericPopup){popupFn=ctx.callGenericPopup;popupType=ctx.POPUP_TYPE||{DISPLAY:1};}else{var w=(typeof window.parent!=='undefined')?window.parent:window;var st=(typeof SillyTavern!=='undefined')?SillyTavern:(w.SillyTavern||null);if(st&&st.callGenericPopup){popupFn=st.callGenericPopup;popupType=st.POPUP_TYPE||{DISPLAY:1};}if(!popupFn&&w.callGenericPopup){popupFn=w.callGenericPopup;popupType=w.POPUP_TYPE||{DISPLAY:1};}}
        if(!popupFn){_msg('error','找不到弹窗API');return;}
        var updBtnStyle=_hasUpdate?'background:#ef4444;color:#fff;border-color:#ef4444;animation:mp-pulse 1.5s infinite':'';
        var updBtnText=_hasUpdate?'🔴 新版本 v'+_e(_remoteVer):'🔄检查更新';
        var S='<style>'
+'#'+_id+'-popup{max-width:580px;margin:0 auto;font-family:system-ui,-apple-system,sans-serif;color:#1e293b}#'+_id+'-popup *{box-sizing:border-box}'
+'.mp-hdr{text-align:center;padding:6px 12px}.mp-t1{font-size:1.2rem;font-weight:800;background:linear-gradient(135deg,#7c3aed,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent}.mp-t2{font-size:.72rem;color:#64748b;margin-top:2px}.mp-cr{font-size:.62rem;color:#94a3b8;margin-top:4px}'
+'.mp-topbar{display:flex;align-items:center;justify-content:space-between;padding:8px 14px;background:#f5f3ff;border-radius:10px;margin-bottom:14px}.mp-topbar label{font-size:.82rem;font-weight:600;cursor:pointer;margin:0;color:#1e293b}.mp-topbar input[type=checkbox]{width:16px;height:16px;accent-color:#7c3aed;cursor:pointer;margin-right:6px}'
+'.mp-pill{padding:2px 8px;border-radius:10px;font-size:.68rem;font-weight:700}.mp-pill-on{background:#dcfce7;color:#166534}.mp-pill-off{background:#fee2e2;color:#991b1b}'
+'.mp-tabs{display:flex;gap:0;border-bottom:2px solid #e4e4e7;margin-bottom:14px;overflow-x:auto;-webkit-overflow-scrolling:touch}.mp-tab{flex:1;min-width:0;padding:10px 4px;text-align:center;font-size:.78rem;font-weight:600;color:#94a3b8;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-2px;transition:all .2s;white-space:nowrap;user-select:none}.mp-tab:hover{color:#7c3aed}.mp-tab.
                function _bindUI(){
        if(!_popup)return;var P=_popup,J=_jq;
        P.find('.mp-tab').on('click',function(){var tab=J(this).attr('data-tab');P.find('.mp-tab').removeClass('active');J(this).addClass('active');P.find('.mp-page').removeClass('active');P.find('#mp-'+tab).addClass('active');});
        P.find('#mp-on').on('change',function(){C.sw=this.checked;_s();P.find('#mp-pill').removeClass('mp-pill-on mp-pill-off').addClass(C.sw?'mp-pill-on':'mp-pill-off').html(C.sw?'● 运行中':'○ 已关闭');_msg('info',C.sw?'已启用':'已关闭');});
        P.find('#mp-lm').on('click',async function(){var b=J(this);b.prop('disabled',true).text('…');C.url=P.find('#mp-url').val().trim();C.key=P.find('#mp-key').val().trim();try{var ls=await _models(),sl=P.find('#mp-mdl').empty();if(ls.length){sl.append('<option value="" disabled>选择模型</option>');ls.forEach(function(m){sl.append(J('<option>',{value:m,text:m}));});if(C.mdl&&ls.indexOf(C.mdl)>=0)sl.val(C.mdl);_msg('success',ls.length+'个模型');}else sl.append('<option value="">无</option>');}catch(e){_msg('error',e.message);}b.prop('disabled',false).text('加载');});
        P.find('#mp-sva').on('click',function(){C.url=P.find('#mp-url').val().trim();C.key=P.find('#mp-key').val().trim();C.mdl=P.find('#mp-mdl').val()||'';C.tp=parseFloat(P.find('#mp-tp').val())||0.3;C.rt=parseInt(P.find('#mp-rt').val())||0;if(!C.url){_msg('warning','填写API地址');return;}_s();_msg('success','已保存');});
        P.find('#mp-apload').on('click',function(){var name=P.find('#mp-apsel').val();if(!name){_msg('warning','选择一个预设');return;}var ad=_loadAP();var found=ad.list.find(function(p){return p.name===name;});if(!found){_msg('error','预设不存在');return;}P.find('#mp-url').val(found.url||'');P.find('#mp-key').val(found.key||'');var $mdl=P.find('#mp-mdl');$mdl.empty();if(found.mdl){$mdl.append('<option value="'+_e(found.mdl)+'">'+_e(found.mdl)+'</option>');$mdl.val(found.mdl);}else{$mdl.append('<option value="">先加载</option>');}P.find('#mp-tp').val(found.tp!==undefined?found.tp:0.3);P.find('#mp-rt').val(found.rt!==undefined?String(found.rt):'0');C.url=found.url||'';C.key=found.key||'';C.mdl=found.mdl||'';C.tp=found.tp!==undefined?found.tp:0.3;C.rt=found.rt!==undefined?found.rt:0;_s();ad.active=name;_saveAP(ad);P.find('#mp-apinfo').text('当前：'+name);_msg('success','已加载「'+name+'」');});
        P.find('#mp-apsave').on('click',function(){var name=P.find('#mp-apname').val().trim();if(!name){_msg('warning','输入预设名称');return;}var item={name:name,url:P.find('#mp-url').val().trim(),key:P.find('#mp-key').val().trim(),mdl:P.find('#mp-mdl').val()||'',tp:parseFloat(P.find('#mp-tp').val())||0.3,rt:parseInt(P.find('#mp-rt').val())||0};var ad=_loadAP();var idx=-1;ad.list.forEach(function(p,i){if(p.name===name)idx=i;});if(idx>=0){ad.list[idx]=item;}else{ad.list.push(item);}ad.active=name;_saveAP(ad);_refreshAPSel();P.find('#mp-apsel').val(name);P.find('#mp-apname').val('');P.find('#mp-apinfo').text('当前：'+name);_msg('success','接口预设「'+name+'」已保存');});
        P.find('#mp-apdel').on('click',function(){var name=P.find('#mp-apsel').val();if(!name){_msg('warning','选择要删除的预设');return;}var ad=_loadAP();ad.list=ad.list.filter(function(p){return p.name!==name;});if(ad.active===name)ad.active='';_saveAP(ad);_refreshAPSel();P.find('#mp-apinfo').text(ad.active?'当前：'+ad.active:'未使用预设');_msg('info','已删除「'+name+'」');});
        P.find('#mp-tst').on('click',async function(){var b=J(this);b.prop('disabled',true).text('…');C.url=P.find('#mp-url').val().trim();C.key=P.find('#mp-key').val().trim();C.mdl=P.find('#mp-mdl').val()||'';try{var r=await _call('她不由自主地叹了口气，不由自主地笑了。');_msg('success','测试'+(r.changed?'成功,有修正':'成功'));}catch(e){_msg('error',e.message);}b.prop('disabled',false).text('🧪 测试');});
        P.find('#mp-svw').on('click',function(){C.wd=P.find('#mp-wta').val().split('\n').filter(function(x){return x.trim();});_s();P.find('#mp-wn').text(C.wd.length+'个');_msg('success',C.wd.length+'个禁词已保存');});
        P.find('#mp-svlw').on('click',function(){C.lw=_parseLW(P.find('#mp-lwta').val());_s();P.find('#mp-lwn').text(C.lw.length+'条');_msg('success',C.lw.length+'条规则已保存');});
        P.find('#mp-svp').on('click',function(){C.pt=P.find('#mp-pta').val().split('\n').filter(function(x){return x.trim();});_s();_msg('success','已保存');});
        P.find('#mp-svr').on('click',function(){C.rl=P.find('#mp-rta').val();_s();_msg('success','已保存');});
        P.find('#mp-sisave').on('click',function(){C.si=P.find('#mp-sita').val();_s();localStorage.setItem(K.siC,'true');P.find('#mp-sibadge').text('自定义').removeClass('mp-badge-def').addClass('mp-badge-cus');_msg('success','已保存');});
        P.find('#mp-sireset').on('click',function(){C.si=_defSI;P.find('#mp-sita').val(_defSI);_s();localStorage.setItem(K.siC,'false');P.find('#mp-sibadge').text('默认').removeClass('mp-badge-cus').addClass('mp-badge-def');_msg('info','已恢复默认');});
        P.find('#mp-spsave').on('click',function(){C.sp=P.find('#mp-spta').val();_s();localStorage.setItem(K.spC,'true');P.find('#mp-spbadge').text('自定义').removeClass('mp-badge-def').addClass('mp-badge-cus');_msg('success','已保存');});
        P.find('#mp-spreset').on('click',function(){C.sp=_defSP;P.find('#mp-spta').val(_defSP);_s();localStorage.setItem(K.spC,'false');P.find('#mp-spbadge').text('默认').removeClass('mp-badge-cus').addClass('mp-badge-def');_msg('info','已恢复默认');});
        P.find('#mp-ptload').on('click',function(){var name=P.find('#mp-ptsel').val();if(!name){_msg('warning','选择一个预设');return;}var pd=_loadPT();var found=pd.list.find(function(p){return p.name===name;});if(!found){_msg('error','预设不存在');return;}C.si=found.si||_defSI;C.sp=found.sp||_defSP;C.rl=found.rl||'';_s();localStorage.setItem(K.siC,'true');localStorage.setItem(K.spC,'true');P.find('#mp-sita').val(C.si);P.find('#mp-spta').val(C.sp);P.find('#mp-rta').val(C.rl);P.find('#mp-sibadge').text('自定义').removeClass('mp-badge-def').addClass('mp-badge-cus');P.find('#mp-spbadge').text('自定义').removeClass('mp-badge-def').addClass('mp-badge-cus');pd.active=name;_savePT(pd);P.find('#mp-ptinfo').text('当前：'+name);_msg('success','已加载「'+name+'」');});
        P.find('#mp-ptsave').on('click',function(){var name=P.find('#mp-ptname').val().trim();if(!name){_msg('warning','输入预设名称');return;}var si=P.find('#mp-sita').val();var sp=P.find('#mp-spta').val();var rl=P.find('#mp-rta').val();var pd=_loadPT();var idx=-1;pd.list.forEach(function(p,i){if(p.name===name)idx=i;});if(idx>=0){pd.list[idx]={name:name,si:si,sp:sp,rl:rl};}else{pd.list.push({name:name,si:si,sp:sp,rl:rl});}pd.active=name;_savePT(pd);_refreshPTSel();P.find('#mp-ptsel').val(name);P.find('#mp-ptname').val('');P.find('#mp-ptinfo').text('当前：'+name);_msg('success','预设「'+name+'」已保存');});
        P.find('#mp-ptdel').on('click',function(){var name=P.find('#mp-ptsel').val();if(!name){_msg('warning','选择要删除的预设');return;}var pd=_loadPT();pd.list=pd.list.filter(function(p){return p.name!==name;});if(pd.active===name)pd.active='';_savePT(pd);_refreshPTSel();P.find('#mp-ptinfo').text(pd.active?'当前：'+pd.active:'未使用预设');_msg('info','已删除「'+name+'」');});
        P.find('#mp-rlload').on('click',function(){var name=P.find('#mp-rlsel').val();if(!name){_msg('warning','选择一个预设');return;}var rd=_loadRL();var found=rd.list.find(function(p){return p.name===name;});if(!found){_msg('error','预设不存在');return;}C.rl=found.content||'';_s();P.find('#mp-rta').val(C.rl);rd.active=name;_saveRL(rd);P.find('#mp-rlinfo').text('当前：'+name);_msg('success','已加载「'+name+'」');});
        P.find('#mp-rlsave').on('click',function(){var name=P.find('#mp-rlname').val().trim();if(!name){_msg('warning','输入预设名称');return;}var content=P.find('#mp-rta').val();var rd=_loadRL();var idx=-1;rd.list.forEach(function(p,i){if(p.name===name)idx=i;});if(idx>=0){rd.list[idx]={name:name,content:content};}else{rd.list.push({name:name,content:content});}rd.active=name;_saveRL(rd);_refreshRLSel();P.find('#mp-rlsel').val(name);P.find('#mp-rlname').val('');P.find('#mp-rlinfo').text('当前：'+name);_msg('success','额外指令预设「'+name+'」已保存');});
        P.find('#mp-rldel').on('click',function(){var name=P.find('#mp-rlsel').val();if(!name){_msg('warning','选择要删除的预设');return;}var rd=_loadRL();rd.list=rd.list.filter(function(p){return p.name!==name;});if(rd.active===name)rd.active='';_saveRL(rd);_refreshRLSel();P.find('#mp-rlinfo').text(rd.active?'当前：'+rd.active:'未使用预设');_msg('info','已删除「'+name+'」');});
        P.find('#mp-go').on('click',async function(){var idx=_findLastAI();if(idx<0){_msg('warning','无AI消息');return;}var b=J(this);b.prop('disabled',true).text('⏳ 审校中…');_veil(idx);await _doCheck(idx,true);b.prop('disabled',false).text('🔍 立即审校最新AI消息');});
        P.find('#mp-undo').on('click',async function(){var backup=_loadBackup();if(!backup||!backup.text){_msg('warning','没有可恢复的原文');return;}var ctx=_ctx();if(!ctx||!ctx.chat||!ctx.chat[backup.idx]){_msg('error','找不到对应消息，可能聊天已切换');return;}var b=J(this);b.prop('disabled',true).text('⏳恢复中…');try{var msgData=ctx.chat[backup.idx];await _applyResult(ctx,backup.idx,msgData,backup.text);_clearBackup();_msg('success','✅ 已恢复原文',{timeOut:3000});}catch(e){_msg('error','恢复失败: '+e.message,{timeOut:5000});}b.prop('disabled',false).text('↩撤销审校，恢复原文');});
        P.find('#mp-logclear').on('click',function(){_saveLogs([]);_refreshLog();_msg('info','已清空');});
        P.find('#mp-upd').on('click',async function(){var b=J(this);b.prop('disabled',true).text('⏳检查中…');try{var code=await _fetchUpdate();if(!code){b.prop('disabled',false).text('🔄检查更新');return;}var m=code.match(/_ver='([^']+)'/);if(!m)throw new Error('无法解析远程版本');var rv=m[1];if(_cmpVer(_ver,rv)>0){_msg('info','发现新版本 v'+rv+'，正在更新…',{timeOut:2000});setTimeout(function(){try{eval(code);_hasUpdate=false;_remoteVer='';_hideDot();_msg('success','✅ 已更新到v'+rv+'，请关闭面板重新打开',{timeOut:6000});}catch(ex){_msg('error','更新执行失败: '+ex.message);}},500);}else{_hasUpdate=false;_remoteVer='';_hideDot();b.css({background:'',color:'',borderColor:'',animation:''});_msg('success','✅ 已是最新版本 v'+_ver,{timeOut:2000});}}catch(e){_msg('error','检查更新失败: '+e.message,{timeOut:3000});}b.prop('disabled',false).text('🔄检查更新');});
        var pvt;P.find('#mp-thcss').on('input',function(){var css=J(this).val();clearTimeout(pvt);pvt=setTimeout(function(){_applyCSS(css);},300);});
        P.find('#mp-thload').on('click',function(){var name=P.find('#mp-thsel').val();if(!name)return;var td=_loadTh(),all=_presets.concat(td.list),found=all.find(function(t){return t.name===name;});if(found){P.find('#mp-thcss').val(found.css);P.find('#mp-thname').val(found.name);_applyCSS(found.css);td.active=name;_saveTh(td);_msg('success','已应用');}});
        P.find('#mp-thsave').on('click',function(){var name=P.find('#mp-thname').val().trim(),css=P.find('#mp-thcss').val();if(!name||!css)return;if(_presets.some(function(t){return t.name===name;})){_msg('warning','不能覆盖内置');return;}var td=_loadTh(),idx=-1;td.list.forEach(function(t,i){if(t.name===name)idx=i;});if(idx>=0)td.list[idx].css=css;else td.list.push({name:name,css:css});td.active=name;_saveTh(td);_applyCSS(css);var $s=P.find('#mp-thsel'),all=_presets.concat(td.list);$s.empty().append('<option value="">—</option>');all.forEach(function(t){$s.append('<option value="'+_e(t.name)+'"'+(t.name===name?' selected':'')+'>'+_e(t.name)+'</option>');});_msg('success','已保存');});
        P.find('#mp-thdel').on('click',function(){var name=P.find('#mp-thsel').val();if(!name)return;if(_presets.some(function(t){return t.name===name;})){_msg('warning','内置不可删');return;}var td=_loadTh();td.list=td.list.filter(function(t){return t.name!==name;});if(td.active===name){td.active='';_applyCSS('');}_saveTh(td);var $s=P.find('#mp-thsel'),all=_presets.concat(td.list);$s.empty().append('<option value="">—</option>');all.forEach(function(t){$s.append('<option value="'+_e(t.name)+'">'+_e(t.name)+'</option>');});P.find('#mp-thcss').val('');P.find('#mp-thname').val('');_msg('info','已删除');});
        P.find('#mp-threset').on('click',function(){var td=_loadTh();td.active='';_saveTh(td);_applyCSS('');P.find('#mp-thcss').val('');P.find('#mp-thsel').val('');P.find('#mp-thname').val('');_msg('info','已还原');});
    }

    var _menuAtt=0,_menuDone=false;
    function _addMenu(){
        if(_menuDone)return;_menuAtt++;
        var pw;try{pw=window.parent||window;}catch(x){pw=window;}
        var pJQ=pw.jQuery||pw.$||_jq;
        if(!pJQ){if(_menuAtt<60){setTimeout(_addMenu,3000);}return;}
        var menu=pJQ('#extensionsMenu');
        if(menu.length&&!pJQ('#'+_id+'-mi').length){
            var wrap=pJQ('<div class="extension_container interactable" id="'+_id+'-mi" tabindex="0" style="position:relative"></div>');
            var item=pJQ('<div class="list-group-item flex-container flexGap5 interactable" title="猫猫审校器"><div class="fa-fw fa-solid fa-paw extensionsMenuExtensionButton"></div><span>猫猫审校器</span></div>');
            var dot=pJQ('<span id="'+_id+'-updot" style="display:none;width:9px;height:9px;background:#ef4444;border-radius:50%;position:absolute;top:4px;right:4px;box-shadow:0 0 4px rgba(239,68,68,0.6);animation:mp-dot-pulse 1.5s infinite"></span>');
            if(!pJQ('#mp-dot-style').length){pJQ('<style id="mp-dot-style">@keyframes mp-dot-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(0.8)}}</style>').appendTo(pJQ('head'));}
            item.on('click',async function(ev){ev.stopPropagation();var btn=pJQ('#extensionsMenuButton');if(btn.length&&menu.is(':visible')){btn.trigger('click');await new Promise(function(r){setTimeout(r,120);});}await _openUI();});
            wrap.append(item).append(dot);menu.append(wrap);
            if(_hasUpdate)dot.show();
            _menuDone=true;console.log('[猫猫审校]菜单已挂载(扩展菜单)');return;
        }
        if(_menuAtt>=10&&!pJQ('#'+_id+'-float').length){
            if(!pJQ('#mp-dot-style').length){pJQ('<style id="mp-dot-style">@keyframes mp-dot-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(0.8)}}</style>').appendTo(pJQ('head'));}
            var fb=pJQ('<div id="'+_id+'-float" style="position:fixed;bottom:80px;right:16px;z-index:99999;width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#ec4899);color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;cursor:pointer;box-shadow:0 4px 15px rgba(124,58,237,0.4);transition:transform .2s;user-select:none" title="猫猫审校器">🐾</div>');
            var fdot=pJQ('<span id="'+_id+'-updot" style="display:none;width:9px;height:9px;background:#ef4444;border-radius:50%;position:absolute;top:0;right:0;box-shadow:0 0 4px rgba(239,68,68,0.6);animation:mp-dot-pulse 1.5s infinite"></span>');
            fb.append(fdot);
            fb.on('click',async function(){await _openUI();});
            fb.on('mouseenter',function(){pJQ(this).css('transform','scale(1.1)');});
            fb.on('mouseleave',function(){pJQ(this).css('transform','scale(1)');});
            pJQ('body').append(fb);
            if(_hasUpdate)fdot.show();
            _menuDone=true;console.log('[猫猫审校]菜单已挂载(浮动按钮)');return;
        }
        if(_menuAtt<60){setTimeout(_addMenu,3000);}
    }

    function _listen(){var ctx=_ctx();var w=(typeof window.parent!=='undefined')?window.parent:window;var evSrc=null,evTypes=null;if(ctx){evSrc=ctx.eventSource||null;evTypes=ctx.event_types||ctx.eventTypes||null;}if(!evSrc)evSrc=w.eventSource||(typeof eventSource!=='undefined'?eventSource:null);if(!evTypes)evTypes=w.event_types||w.eventTypes||(typeof event_types!=='undefined'?event_types:null)||(typeof tavern_events!=='undefined'?tavern_events:null);var bound=false;
        function _autoTrigger(){if(!C.sw||_busy)return;setTimeout(function(){if(_busy)return;var i=_findLastAI();if(i<0)return;var ctx2=_ctx();if(!ctx2||!ctx2.chat||!ctx2.chat[i])return;var txt=ctx2.chat[i].mes||'';if(_isChecked(i,txt))return;_veil(i);_doCheck(i,false);},1500);}
        if(evSrc&&evTypes&&evTypes.GENERATION_ENDED){evSrc.on(evTypes.GENERATION_ENDED,function(){_autoTrigger();});bound=true;}
        if(!bound&&evSrc&&evTypes&&evTypes.MESSAGE_RECEIVED){evSrc.on(evTypes.MESSAGE_RECEIVED,function(){_autoTrigger();});bound=true;}
        if(!bound&&typeof eventOn==='function'){var tevt=(typeof tavern_events!=='undefined')?tavern_events:((typeof event_types!=='undefined')?event_types:null);if(tevt&&tevt.GENERATION_ENDED){eventOn(tevt.GENERATION_ENDED,function(){_autoTrigger();});bound=true;}}
        var lastLen=0;var ctx0=_ctx();if(ctx0&&ctx0.chat)lastLen=ctx0.chat.length;
        setInterval(function(){if(!C.sw||_busy)return;var ctx2=_ctx();if(!ctx2||!ctx2.chat)return;var n=ctx2.chat.length;if(n>lastLen&&n>0){var li=n-1;lastLen=n;var m=ctx2.chat[li];if(m&&!m.is_user&&!m.is_system){var txt=m.mes||'';if(_isChecked(li,txt))return;setTimeout(function(){if(_busy)return;var orig=m.mes||'';if(_isChecked(li,orig))return;var need=C.wd.some(function(ww){return ww.trim()&&orig.indexOf(ww.trim())>=0;})||_checkLimits(orig).length>0||(C.rl&&C.rl.trim())||C.pt.some(function(x){return x.trim();});if(need){_veil(li);_doCheck(li,false);}else{_markChecked(li,orig);}},bound?5000:2000);}}else lastLen=n;},3000);}

    function _checkReady(){var w=(typeof window.parent!=='undefined')?window.parent:window;_jq=(typeof jQuery!=='undefined')?jQuery:w.jQuery;if(!_jq&&typeof w.$!=='undefined')_jq=w.$;_tt=w.toastr||(typeof toastr!=='undefined'?toastr:null);return!!_jq;}
    function _checkFull(){var ctx=_ctx();_ok=!!(ctx&&ctx.chat);return _ok;}
    var _att=0;
    function _init(){_att++;if(_checkReady()){_l();_addMenu();_initTheme();if(_checkFull()){_listen();console.log('[猫猫审校]v'+_ver+'完整初始化');}else{console.log('[猫猫审校]v'+_ver+'菜单已加载，等待聊天就绪…');var _waitChat=setInterval(function(){if(_checkFull()){clearInterval(_waitChat);_listen();console.log('[猫猫审校]聊天就绪，监听已启动');}},3000);}setTimeout(_silentCheck,5000);}else if(_att<30){setTimeout(_init,2000);}else{console.warn('[猫猫审校]初始化超时');}}

    function _cleanOld(){try{window[_id+'_init']=undefined;}catch(x){}var prefix=_id+'_v';try{var keys=Object.keys(window);for(var i=0;i<keys.length;i++){var k=keys[i];if(k.indexOf(prefix)===0&&k!==_flag){try{window[k]=undefined;}catch(x){}}}}catch(x){}if(typeof window[_id+'_cleanup']==='function'){try{window[_id+'_cleanup']();}catch(x){}}}

    if(!window[_flag]){
        _cleanOld();window[_flag]=true;
        var iv=setInterval(function(){var w=(typeof window.parent!=='undefined')?window.parent:window;if(typeof jQuery!=='undefined'||typeof $!=='undefined'||w.jQuery){clearInterval(iv);_jq=(typeof jQuery!=='undefined')?jQuery:(w.jQuery||w.$);if(document.readyState==='complete'||document.readyState==='interactive'){setTimeout(_init,3000);}else{document.addEventListener('DOMContentLoaded',function(){setTimeout(_init,3000);});}}},200);
        window[_id+'_cleanup']=function(){try{var pw=(window.parent||window);var doc=pw.document;var el=doc.querySelector('#'+_id+'-mi');if(el)el.remove();var fl=doc.querySelector('#'+_id+'-float');if(fl)fl.remove();}catch(x){}_ok=false;C.sw=false;};}
})();
