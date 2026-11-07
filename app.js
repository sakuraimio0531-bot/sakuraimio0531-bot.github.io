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
