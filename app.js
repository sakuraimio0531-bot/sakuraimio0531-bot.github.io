/**
 * Nexus Hub - Interactive Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  initTypewriter();
  initThemeToggle();
  initLiveClock();
  initParticleCanvas();
  initProjectFilters();
  initModal();
  initPomodoro();
  initQuotes();
  initQuickNotes();
  initContactForm();
  initChihuahuaBot();
});

/* ----------------------------------------------------
   1. 打字機動畫 (Typewriter Effect)
   ---------------------------------------------------- */
function initTypewriter() {
  const words = [
    '現代化互動網頁體驗',
    '極簡毛玻璃視覺美學',
    '高流暢度前端動效',
    '實用數位生產力工具'
  ];
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const speed = 100;
  const target = document.getElementById('typewriter');

  if (!target) return;

  function type() {
    const currentWord = words[wordIndex];
    if (isDeleting) {
      target.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
    } else {
      target.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
    }

    let delay = speed;
    if (isDeleting) delay /= 2;

    if (!isDeleting && charIndex === currentWord.length) {
      delay = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      delay = 500;
    }

    setTimeout(type, delay);
  }

  type();
}

/* ----------------------------------------------------
   2. 深色 / 淺色 主題切換 (Theme Toggle)
   ---------------------------------------------------- */
function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  const icon = toggleBtn.querySelector('.theme-icon');
  
  // 讀取記憶中的主題偏好
  const savedTheme = localStorage.getItem('nexus_theme') || 'dark';
  document.body.setAttribute('data-theme', savedTheme);
  updateIcon(savedTheme);

  toggleBtn.addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('nexus_theme', newTheme);
    updateIcon(newTheme);
    showToast(`已切換至 ${newTheme === 'dark' ? '深色夜間模式 🌙' : '明亮日間模式 ☀️'}`);
  });

  function updateIcon(theme) {
    if (icon) {
      icon.textContent = theme === 'dark' ? '🌙' : '☀️';
    }
  }
}

/* ----------------------------------------------------
   3. 即時時鐘 (Live Clock)
   ---------------------------------------------------- */
function initLiveClock() {
  const clockEl = document.getElementById('live-clock');
  function update() {
    if (!clockEl) return;
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    const secs = String(now.getSeconds()).padStart(2, '0');
    clockEl.textContent = `${hours}:${mins}:${secs}`;
  }
  update();
  setInterval(update, 1000);
}

/* ----------------------------------------------------
   4. 原生 HTML5 粒子星空畫布 (Particle Canvas)
   ---------------------------------------------------- */
function initParticleCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const mouse = { x: null, y: null, radius: 120 };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
  });

  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 2 + 1;
      this.baseX = this.x;
      this.baseY = this.y;
      this.density = Math.random() * 20 + 5;
      this.vx = (Math.random() - 0.5) * 0.8;
      this.vy = (Math.random() - 0.5) * 0.8;
    }

    draw() {
      const isDark = document.body.getAttribute('data-theme') === 'dark';
      ctx.fillStyle = isDark ? 'rgba(99, 102, 241, 0.45)' : 'rgba(99, 102, 241, 0.25)';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx = -this.vx;
      if (this.y < 0 || this.y > height) this.vy = -this.vy;

      // 游標互動磁吸效果
      if (mouse.x != null && mouse.y != null) {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouse.radius) {
          let force = (mouse.radius - distance) / mouse.radius;
          let directionX = (dx / distance) * force * 3;
          let directionY = (dy / distance) * force * 3;
          this.x -= directionX;
          this.y -= directionY;
        }
      }
    }
  }

  const particles = [];
  const particleCount = Math.min(Math.floor((width * height) / 12000), 80);
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();

      // 連線粒子
      for (let j = i + 1; j < particles.length; j++) {
        let dx = particles[i].x - particles[j].x;
        let dy = particles[i].y - particles[j].y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 110) {
          const isDark = document.body.getAttribute('data-theme') === 'dark';
          const alpha = (1 - dist / 110) * (isDark ? 0.2 : 0.1);
          ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
}

/* ----------------------------------------------------
   5. 專案分類篩選 (Project Filter)
   ---------------------------------------------------- */
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      projectCards.forEach((card) => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.4s ease';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ----------------------------------------------------
   6. 詳情彈出視窗 (Modal)
   ---------------------------------------------------- */
function initModal() {
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalClose = document.getElementById('modal-close');
  const modalActionBtn = document.getElementById('modal-action-btn');
  const modalOverlay = document.getElementById('modal-overlay');

  document.querySelectorAll('.preview-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const title = btn.getAttribute('data-title');
      const desc = btn.getAttribute('data-desc');
      modalTitle.textContent = title;
      modalDesc.textContent = desc;
      modal.classList.add('active');
    });
  });

  const closeModal = () => modal.classList.remove('active');
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalActionBtn) modalActionBtn.addEventListener('click', closeModal);
  if (modalOverlay) modalOverlay.addEventListener('click', closeModal);
}

/* ----------------------------------------------------
   7. 專注番茄鐘 (Pomodoro Timer)
   ---------------------------------------------------- */
function initPomodoro() {
  const minsEl = document.getElementById('timer-mins');
  const secsEl = document.getElementById('timer-secs');
  const startBtn = document.getElementById('timer-start');
  const pauseBtn = document.getElementById('timer-pause');
  const resetBtn = document.getElementById('timer-reset');
  const statusEl = document.getElementById('timer-status');

  let defaultSeconds = 25 * 60;
  let remainingSeconds = defaultSeconds;
  let timerInterval = null;

  function updateDisplay() {
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    minsEl.textContent = String(mins).padStart(2, '0');
    secsEl.textContent = String(secs).padStart(2, '0');
  }

  function playTone(freq = 600, duration = 0.25) {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // AudioContext fallback
    }
  }

  startBtn.addEventListener('click', () => {
    if (timerInterval) return;
    playTone(520, 0.15);
    statusEl.textContent = '專注中 🔥';
    statusEl.style.color = '#38bdf8';
    timerInterval = setInterval(() => {
      if (remainingSeconds > 0) {
        remainingSeconds--;
        updateDisplay();
      } else {
        clearInterval(timerInterval);
        timerInterval = null;
        statusEl.textContent = '已完成 🎉';
        statusEl.style.color = '#10b981';
        playTone(880, 0.5);
        showToast('🎉 25 分鐘番茄鐘專注完成！該放鬆一下囉！');
      }
    }, 1000);
  });

  pauseBtn.addEventListener('click', () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
      statusEl.textContent = '已暫停 ⏸️';
      statusEl.style.color = '#f59e0b';
      playTone(400, 0.15);
    }
  });

  resetBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    timerInterval = null;
    remainingSeconds = defaultSeconds;
    updateDisplay();
    statusEl.textContent = '待命';
    statusEl.style.color = '#10b981';
  });
}

/* ----------------------------------------------------
   8. 靈感金句庫 (Quotes Generator)
   ---------------------------------------------------- */
function initQuotes() {
  const quotes = [
    { text: '「將複雜的事情簡化，是工程師最極致的優雅。」', author: '— 匿名先驅' },
    { text: '「Talk is cheap. Show me the code.」', author: '— Linus Torvalds' },
    { text: '「每一個偉大的程式，都始於一個勇敢的 git init。」', author: '— 數位創作者' },
    { text: '「簡潔是可靠的前提。」', author: '— Edsger W. Dijkstra' },
    { text: '「學會學習，是軟體工程師最核心的超能力。」', author: '— 現代開發者指南' }
  ];

  const textEl = document.getElementById('quote-text');
  const authorEl = document.getElementById('quote-author');
  const btn = document.getElementById('quote-btn');
  const nextBtn = document.getElementById('quote-next');

  function randomQuote() {
    const current = textEl.textContent;
    let available = quotes.filter((q) => q.text !== current);
    let chosen = available[Math.floor(Math.random() * available.length)] || quotes[0];
    
    textEl.style.opacity = '0';
    authorEl.style.opacity = '0';
    setTimeout(() => {
      textEl.textContent = chosen.text;
      authorEl.textContent = chosen.author;
      textEl.style.opacity = '1';
      authorEl.style.opacity = '1';
    }, 200);
  }

  btn.addEventListener('click', randomQuote);
  nextBtn.addEventListener('click', randomQuote);
}

/* ----------------------------------------------------
   9. 心流即時便箋 (Quick Notes with LocalStorage)
   ---------------------------------------------------- */
function initQuickNotes() {
  const noteArea = document.getElementById('quick-note');
  const charCount = document.getElementById('char-count');
  const clearBtn = document.getElementById('clear-note');
  const saveStatus = document.getElementById('save-status');

  // 讀取既有筆記
  const saved = localStorage.getItem('nexus_quicknote') || '';
  noteArea.value = saved;
  updateCount();

  noteArea.addEventListener('input', () => {
    localStorage.setItem('nexus_quicknote', noteArea.value);
    updateCount();
    saveStatus.textContent = '已即時儲存 ✔️';
    setTimeout(() => {
      saveStatus.textContent = '已同步';
    }, 1500);
  });

  clearBtn.addEventListener('click', () => {
    if (confirm('確定要清空便箋內容嗎？')) {
      noteArea.value = '';
      localStorage.removeItem('nexus_quicknote');
      updateCount();
      showToast('便箋已清空');
    }
  });

  function updateCount() {
    charCount.textContent = `${noteArea.value.length} 字元`;
  }
}

/* ----------------------------------------------------
   10. 聯絡表單送出模擬 (Contact Form)
   ---------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    showToast(`感謝 ${name}！您的留言已成功送出 ✨`);
    form.reset();
  });
}

/* ----------------------------------------------------
   11. 浮動提示 Toast (Utility)
   ---------------------------------------------------- */
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

/* ----------------------------------------------------
   12. 吉娃娃智能客服 (Chihuahua AI Bot)
   ---------------------------------------------------- */
function initChihuahuaBot() {
  const launcher = document.getElementById('bot-launcher');
  const windowEl = document.getElementById('bot-window');
  const closeBtn = document.getElementById('bot-close');
  const clearBtn = document.getElementById('bot-clear');
  const bubble = document.getElementById('bot-bubble');
  const bubbleClose = document.getElementById('bubble-close');
  const form = document.getElementById('bot-form');
  const input = document.getElementById('bot-input');
  const chatBody = document.getElementById('bot-chat-body');
  const chips = document.querySelectorAll('.chip');

  if (!launcher || !windowEl) return;

  // 迷你吉娃娃 SVG 圖示
  const miniChihuahuaSvg = `
    <svg viewBox="0 0 100 100" class="chihuahua-avatar-svg">
      <polygon points="18,48 5,6 40,26" fill="#D99B61" stroke="#7A4B1F" stroke-width="2.5"/>
      <polygon points="20,44 11,14 36,28" fill="#F8B88B"/>
      <polygon points="82,48 95,6 60,26" fill="#D99B61" stroke="#7A4B1F" stroke-width="2.5"/>
      <polygon points="80,44 89,14 64,28" fill="#F8B88B"/>
      <circle cx="50" cy="54" r="34" fill="#D99B61" stroke="#7A4B1F" stroke-width="2.5"/>
      <circle cx="30" cy="62" r="5" fill="#FFAAA6" opacity="0.6"/>
      <circle cx="70" cy="62" r="5" fill="#FFAAA6" opacity="0.6"/>
      <ellipse cx="36" cy="52" rx="9" ry="11" fill="#1C1917"/>
      <circle cx="33" cy="48" r="3" fill="#FFFFFF"/>
      <ellipse cx="64" cy="52" rx="9" ry="11" fill="#1C1917"/>
      <circle cx="61" cy="48" r="3" fill="#FFFFFF"/>
      <ellipse cx="50" cy="67" rx="13" ry="9" fill="#FFF3E8"/>
      <ellipse cx="50" cy="63" rx="4.5" ry="3" fill="#24140E"/>
      <path d="M46 66 Q50 69 54 66" stroke="#24140E" stroke-width="2" fill="none"/>
      <path d="M48 68 Q50 73 52 68 Z" fill="#FF6B8B"/>
    </svg>
  `;

  // 播放吉娃娃輕快的叫聲 / 訊息提示音
  function playPuppyBark() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      // 高音小狗短吠頻率曲線
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1400, audioCtx.currentTime + 0.06);
      osc.frequency.exponentialRampToValueAtTime(900, audioCtx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch (e) {
      // AudioContext fallback
    }
  }

  // 加入訊息至對話視窗
  function appendMessage(sender, text) {
    const row = document.createElement('div');
    row.className = `msg-row ${sender}`;

    if (sender === 'bot') {
      const avatar = document.createElement('div');
      avatar.className = 'msg-mini-avatar';
      avatar.innerHTML = miniChihuahuaSvg;
      row.appendChild(avatar);
    }

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.innerHTML = text;
    row.appendChild(bubble);

    chatBody.appendChild(row);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  // 顯示打字中動畫
  function showTyping() {
    const row = document.createElement('div');
    row.className = 'msg-row bot typing-row';
    row.id = 'bot-typing';

    const avatar = document.createElement('div');
    avatar.className = 'msg-mini-avatar';
    avatar.innerHTML = miniChihuahuaSvg;
    row.appendChild(avatar);

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.innerHTML = `
      <div class="typing-dots">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    `;
    row.appendChild(bubble);
    chatBody.appendChild(row);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function removeTyping() {
    const el = document.getElementById('bot-typing');
    if (el) el.remove();
  }

  // 預設歡迎詞
  function initWelcomeMessage() {
    chatBody.innerHTML = '';
    appendMessage(
      'bot',
      '汪汪！我是駐站智能吉祥物兼首席客服【吉寶】🐶！<br>別看我體型小還一直在發抖，我腦子裡裝滿了網站指引！請問有什麼我可以協助您的？汪！'
    );
  }
  initWelcomeMessage();

  // 智能知識庫回應邏輯
  function generateReply(q) {
    const query = q.toLowerCase().trim();

    if (/你是誰|叫什麼|名字|介紹你|身份|自我介紹/.test(query)) {
      return '汪汪！我是吉寶，這座 Nexus Hub 的守護吉娃娃！我的職責是替作者 sakuraimio0531 招待每一位尊貴的訪客！我有高達 100% 的熱情度喔！';
    }

    if (/網站|幹嘛|介紹|內容|功能|有什麼/.test(query)) {
      return '這座網站是 sakuraimio0531 的個人數位空間！特色包括：<br>✦ 現代毛玻璃美學與星空粒子畫布<br>✦ 25 分鐘專注番茄鐘<br>✦ 每日靈感金句產生器<br>✦ 快速心流隨手便箋<br>✦ 還有最可愛的我！汪！';
    }

    if (/番茄鐘|專注|計時|timer|pomodoro/.test(query)) {
      return '滑到網頁的「即時互動實驗室」區塊，點擊「開始專注」按鈕即可啟動 25 分鐘倒數！時間到了會播放提示音提醒你休息，保護眼睛！汪！';
    }

    if (/聯絡|作者|信箱|email|github|聯絡方式|找誰|聯絡作者/.test(query)) {
      return '你可以透過以下方式找到作者唷：<br>📫 <b>Email:</b> sakuraimio0531@gmail.com<br>🐙 <b>GitHub:</b> @sakuraimio0531-bot<br>或者直接在網頁下方的聯絡表單留言，我們會第一時間收到！汪！';
    }

    if (/發抖|抖|冷|害怕|為什麼發抖/.test(query)) {
      return '（持續劇烈發抖）汪！本吉娃娃發抖才不是因為冷或害怕！這是體內強大的高頻 CPU 運算超頻產生的微震動！懂不懂高端 AI 科技的浪漫啊汪！😤';
    }

    if (/骨頭|肉|吃|餓|食物|點心|飼料/.test(query)) {
      return '（雙眼發光，尾巴搖成螺旋槳）🍖 汪嗚！肉骨頭！太香了吧！謝謝大善人！吉寶體力值與運算速度直接 +9999！現在能回答你 100 個問題！';
    }

    if (/好可愛|可愛|摸摸|乖|萌/.test(query)) {
      return '（害羞地原地轉了三圈）汪汪！被誇獎了！吉度害羞！你人真好，吉寶認證你為本站的終身榮譽 VIP！✨🐶';
    }

    if (/你好|哈囉|嗨|hi|hello|安安|早安|午安|晚安/.test(query)) {
      return '汪！你好你好！吉寶熱烈歡迎你！今天想探索網站的哪個酷炫功能呢？可以直接點擊上方的快捷按鈕問我唷！';
    }

    if (/再見|掰掰|bye|先走|下線/.test(query)) {
      return '汪嗚...要走了嗎？吉寶會想你的！隨時點擊右下角，我一直都在這裡守護著網站！祝你有美好的一天，掰掰汪！👋';
    }

    if (/謝謝|感謝|thx|thank/.test(query)) {
      return '不客氣汪！能為您服務是吉寶的榮幸！有任何需要隨時召喚我！🐶✨';
    }

    // 預設聰明回答
    const fallbacks = [
      '汪汪！這個問題太深奧了，吉娃娃的大腦正在以 5000 RPM 瘋狂運轉... 您可以點擊上方的快捷標籤，或是詢問我關於「網站功能」、「番茄鐘」或「作者聯絡方式」唷！',
      '（歪頭睜大眼睛盯著你看）汪？這個吉寶還在努力學習中！要不要試試問我「你是誰」或「為什麼一直發抖」？汪！',
      '汪嗚！雖然我是吉娃娃，但我懂的可不少！您可以詢問作者的 GitHub、如何使用小工具，或是給我一根肉骨頭！🍖'
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  // 處理使用者送出問題
  function handleUserQuery(query) {
    if (!query) return;
    appendMessage('user', query);
    input.value = '';

    showTyping();

    // 模擬思考延遲 400ms ~ 700ms
    setTimeout(() => {
      removeTyping();
      const reply = generateReply(query);
      appendMessage('bot', reply);
      playPuppyBark();
    }, 550);
  }

  // 事件綁定
  launcher.addEventListener('click', () => {
    windowEl.classList.toggle('active');
    if (bubble) bubble.style.display = 'none';
    if (windowEl.classList.contains('active')) {
      input.focus();
      playPuppyBark();
    }
  });

  closeBtn.addEventListener('click', () => {
    windowEl.classList.remove('active');
  });

  if (bubbleClose) {
    bubbleClose.addEventListener('click', (e) => {
      e.stopPropagation();
      bubble.style.display = 'none';
    });
  }

  clearBtn.addEventListener('click', () => {
    initWelcomeMessage();
    showToast('吉娃娃對話紀錄已清空 🐶');
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (query) handleUserQuery(query);
  });

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const q = chip.getAttribute('data-query');
      handleUserQuery(q);
    });
  });
}
