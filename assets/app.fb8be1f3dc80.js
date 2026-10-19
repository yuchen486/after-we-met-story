(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const story = window.STORY;
  let active = 0, mode = 'continuous', size = 20, toastTimer;
  const aliases = { company: 'meeting' };
  const canonical = (id) => aliases[id] || id;
  const storage = { get(k) { try { return localStorage.getItem('lxw-story:' + k); } catch { return null; } }, set(k,v) { try { localStorage.setItem('lxw-story:' + k,v); return true; } catch { return false; } } };
  const toast = (text) => { $('#toast').textContent = text; $('#toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 2600); };
  const count = story.chapters.reduce((n,c) => n + c.paragraphs.join('').length, 0);
  $('#read-time').textContent = `约 ${Math.ceil(count / 350)} 分钟`;
  story.chapters.forEach((c,i) => {
    const link = document.createElement('a'); link.href = '#' + c.id;
    const key = document.createElement('span'); key.className = 'nav-keyword'; key.textContent = c.keyword;
    const label = document.createElement('span'); label.className = 'nav-title'; label.textContent = c.title; link.append(key,label);
    link.addEventListener('click', (e) => { if (mode === 'chapter') { e.preventDefault(); go(i); } else { active = i; updateNavigation(); } });
    $('#chapter-nav').append(link);
    const article = document.createElement('article'); article.className = 'chapter'; article.id = c.id; article.setAttribute('aria-labelledby', c.id + '-title');
    const head = document.createElement('div'); head.className = 'chapter-head';
    const index = document.createElement('span'); index.className = 'chapter-index'; index.textContent = c.keyword;
    const h2 = document.createElement('h2'); h2.id = c.id + '-title'; h2.textContent = c.title;
    head.append(index,h2);
    const prose = document.createElement('div'); prose.className = 'prose';
    c.paragraphs.forEach(text => { const p = document.createElement('p'); p.textContent = text; prose.append(p); });
    article.append(head,prose); $('#chapters').append(article);
  });
  const articles = [...document.querySelectorAll('.chapter')];
  function updateNavigation() {
    document.querySelectorAll('#chapter-nav a').forEach((a,i) => { if (i === active) a.setAttribute('aria-current','location'); else a.removeAttribute('aria-current'); });
    $('#chapter-counter').textContent = `${active+1} / ${articles.length}`;
    $('#previous').disabled = active === 0; $('#next').disabled = active === articles.length-1;
    $('.story-end').hidden = mode === 'chapter' && active !== articles.length-1;
  }
  function applyMode() { articles.forEach((a,i) => { a.hidden = mode === 'chapter' && i !== active; }); $('#continuous').setAttribute('aria-pressed',String(mode === 'continuous')); $('#chapter-mode').setAttribute('aria-pressed',String(mode === 'chapter')); $('.chapter-controls').hidden = mode !== 'chapter'; updateNavigation(); if(mode === 'chapter') updateProgress(); }
  function go(i) { active = Math.max(0,Math.min(i,articles.length-1)); applyMode(); history.replaceState(null,'','#'+story.chapters[active].id); if(mode === 'chapter') $('#reader').scrollIntoView(); else articles[active].scrollIntoView(); }
  $('#chapter-mode').onclick = () => { mode = 'chapter'; applyMode(); $('#reader').scrollIntoView(); toast('已切换为分节阅读'); };
  $('#continuous').onclick = () => { const target = articles[active]; mode = 'continuous'; applyMode(); target.scrollIntoView(); toast('已切换为连读'); };
  $('#previous').onclick = () => go(active-1); $('#next').onclick = () => go(active+1);
  function updateProgress() {
    let percentage;
    if(mode === 'chapter') { const rect = articles[active].getBoundingClientRect(); const within = Math.max(0,Math.min(1,(window.innerHeight - rect.top) / Math.max(rect.height,1))); percentage = Math.round((active + within) / articles.length * 100); }
    else { const rect = $('#chapters').getBoundingClientRect(); percentage = Math.round(Math.max(0,Math.min(1,(window.innerHeight - rect.top) / Math.max(rect.height,1))) * 100); if(rect.top < window.innerHeight) { let candidate = 0; articles.forEach((a,i) => { if(a.getBoundingClientRect().top <= window.innerHeight * .4) candidate = i; }); if(active !== candidate) { active = candidate; updateNavigation(); } } }
    $('#progress-fill').style.width = percentage+'%'; $('#progress-label').textContent = '阅读进度 '+percentage+'%'; $('.progress-track').setAttribute('aria-valuenow',String(percentage));
  }
  let pending = false; window.addEventListener('scroll', () => { if(!pending) { pending = true; requestAnimationFrame(() => { pending = false; updateProgress(); }); } },{passive:true}); window.addEventListener('resize',updateProgress);
  function setSize(value) { size = Math.max(17,Math.min(25,value)); document.documentElement.style.setProperty('--body-size',size+'px'); $('#size-label').textContent = String(size); $('#smaller').disabled = size <= 17; $('#larger').disabled = size >= 25; storage.set('size',String(size)); updateProgress(); }
  $('#smaller').onclick = () => setSize(size-1); $('#larger').onclick = () => setSize(size+1);
  const savedSize = Number(storage.get('size')); if(savedSize >= 17 && savedSize <= 25) setSize(savedSize);
  function setTheme(night) { document.body.classList.toggle('night',night); $('#theme').setAttribute('aria-pressed',String(night)); $('#theme span').textContent = night ? '日读' : '夜读'; storage.set('night',String(night)); }
  setTheme(storage.get('night') === 'true'); $('#theme').onclick = () => setTheme(!document.body.classList.contains('night'));
  function showBookmark() { const mark = canonical(storage.get('bookmark')); $('#resume').hidden = !story.chapters.some(c => c.id === mark); }
  $('#bookmark').onclick = () => { const ok = storage.set('bookmark',story.chapters[active].id); showBookmark(); toast(ok ? `已记住《${story.chapters[active].title}》` : '浏览器未允许保存书签，请收藏本页章节链接'); };
  $('#resume').onclick = () => { const i = story.chapters.findIndex(c => c.id === canonical(storage.get('bookmark'))); if(i >= 0) go(i); };
  showBookmark();
  function chooseExcerpt(index) { $('#selected-excerpt').textContent = story.excerpts[index]; document.querySelectorAll('#excerpt-options button').forEach((b,i) => b.setAttribute('aria-pressed',String(i === index))); }
  ['推算','朋友','未说完'].forEach((label,i) => { const b = document.createElement('button'); b.textContent = label; b.onclick = () => chooseExcerpt(i); $('#excerpt-options').append(b); }); chooseExcerpt(0);
  $('#copy-excerpt').onclick = async () => { const value = $('#selected-excerpt').textContent; try { await navigator.clipboard.writeText(value); toast('已复制这一句'); } catch { const selection = window.getSelection(); const range = document.createRange(); range.selectNodeContents($('#selected-excerpt')); selection.removeAllRanges(); selection.addRange(range); toast('请长按或按 Ctrl+C 复制已选中的句子'); } };
  story.evidence.forEach(([date,quote,note]) => { const row = document.createElement('div'); row.className = 'evidence-item'; const time = document.createElement('span'); time.textContent = date; const text = document.createElement('div'); const q = document.createElement('q'); q.textContent = quote; const small = document.createElement('small'); small.textContent = note; text.append(q,small); row.append(time,text); $('#evidence-list').append(row); });
  story.synopsis.forEach(([keyword,text],i) => { const row = document.createElement('div'); row.className = 'synopsis-row'; const link = document.createElement('a'); link.href = '#'+story.chapters[i].id; link.textContent = keyword; link.onclick = (event) => { event.preventDefault(); go(i); }; const paragraph = document.createElement('p'); paragraph.textContent = text; row.append(link,paragraph); $('#synopsis-list').append(row); });
  $('#print').onclick = () => window.print();
  function handleHash() { const index = story.chapters.findIndex(c => c.id === canonical(location.hash.slice(1))); if(index >= 0) { active = index; applyMode(); requestAnimationFrame(() => articles[index].scrollIntoView()); } }
  window.addEventListener('hashchange',handleHash); updateNavigation(); updateProgress(); handleHash();
})();
