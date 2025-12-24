function(){
  window.TV = {
    data: {
      nation: '',
      race: '',
      raceDetail      setTimeout(function() {
        var radio = document.getElementById('tv-p4');
        if (radio) radio.checked = true;
      }, 350);
    },
    
    setJob: function(el) {
      var self = this;
      document.querySelectorAll('.tv-j-opt').forEach(function(o) {
        o.classList.remove('selected');
      });
      el.classList.add('selected');
      self.data.job = el.dataset.job;
      self.updateSummary();
      
      setTimeout(function() {
        var radio = document.getElementById('tv-p5');
        if (radio) radio.checked = true;
      }, 350);
    },
    
    updateSummary: function() {
      var d = this.data;
      var nationEl = document.getElementById('sum-nation');
      if (nationEl) nationEl.textContent = d.nation || '—';
      
      var raceText = d.race || '—';
      if (d.race && d.raceDetail) raceText = d.race + '（' + d.raceDetail + '）';
      var raceEl = document.getElementById('sum-race');
      if (raceEl) raceEl.textContent = raceText;
      
      var jobEl = document.getElementById('sum-job');
      if (jobEl) jobEl.textContent = d.job || '—';
      
      var finalText = '我已完成角色基础设定：';
      if (d.nation) finalText += '【国家：' + d.nation + '】';
      if (d.race) finalText += '【种族：' + raceText + '】';
      if (d.job) finalText += '【职业：' + d.job + '】';
      finalText += '，请继续引导我完成角色创建的下一步。';
      
      var finalEl = document.getElementById('final-text');
      if (finalEl) finalEl.textContent = finalText;
    },
    
    reset: function() {
      this.data = { nation: '', race: '', raceDetail: '', job: '' };
      document.querySelectorAll('.tv-r-opt, .tv-j-opt').forEach(function(o) {
        o.classList.remove('selected');
      });
      document.querySelectorAll('.tv-tog').forEach(function(c) {
        c.checked = false;
      });
      var y = document.getElementById('yokaiInput');
      var w = document.getElementById('wulingInput');
      if (y) y.value = '';
      if (w) w.value = '';
      this.updateSummary();
      var p = document.getElementById('tv-p1');
      if (p) p.checked = true;
    }
  };
  console.log('[Teravia] TV 对象已加载');
})();
