/* ==========================================
   FOGUETE.SHOP - INTERACTIVE JS CONTROLS
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  initModalsAndForms();
  initFeatureTabs();
  initStatsCounters();
  initScrollAnimationsFallback();
  initDemoTour();
});

/* ==========================================
   1. Modal Dialogs & Form Management
   ========================================== */
function initModalsAndForms() {
  const waitlistModal = document.getElementById('waitlist-modal');
  const successModal = document.getElementById('success-modal');
  const demoVideoModal = document.getElementById('demo-video-modal');

  // Fallback for browsers that do not support declarative Invoker commands
  const supportsInvokers = 'commandForElement' in HTMLButtonElement.prototype;
  
  if (!supportsInvokers) {
    // Event delegation for opening modals via buttons with [commandfor]
    document.addEventListener('click', (event) => {
      const button = event.target.closest('button[commandfor]');
      if (!button) return;

      const targetId = button.getAttribute('commandfor');
      const command = button.getAttribute('command');
      const dialog = document.getElementById(targetId);

      if (dialog && dialog.tagName === 'DIALOG') {
        if (command === 'show-modal') {
          dialog.showModal();
          dialog.style.opacity = '1';
        } else if (command === 'close') {
          dialog.close();
        }
      }
    });
  }

  // Fallback for Light-dismiss (clicking outside dialog content closes it)
  const dialogs = [waitlistModal, successModal, demoVideoModal];
  const supportsLightDismiss = 'closedBy' in HTMLDialogElement.prototype;

  if (!supportsLightDismiss) {
    dialogs.forEach(dialog => {
      if (!dialog) return;
      dialog.addEventListener('click', (event) => {
        // Clicks directly on the dialog element are clicks on the backdrop
        if (event.target !== dialog) return;

        const rect = dialog.getBoundingClientRect();
        const isWithinContent = (
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        );

        if (!isWithinContent) {
          dialog.close();
        }
      });
    });
  }

  // Handle Waitlist Form Submissions
  const bottomForm = document.getElementById('waitlist-form-bottom');
  const modalForm = document.getElementById('waitlist-form-modal');

  // Base queue position starting state
  let queueCount = parseInt(localStorage.getItem('foguete_queue_count') || '2482');

  function handleWaitlistJoin(email, name = 'Criador') {
    // Save to localStorage to simulate a database registry
    const leads = JSON.parse(localStorage.getItem('foguete_leads') || '[]');
    leads.push({ email, name, date: new Date().toISOString() });
    localStorage.setItem('foguete_leads', JSON.stringify(leads));

    // Increment and save queue position
    queueCount += 1;
    localStorage.setItem('foguete_queue_count', queueCount.toString());

    // Update queue position in Success modal UI
    const queueDisplay = document.getElementById('success-queue-pos');
    if (queueDisplay) {
      queueDisplay.textContent = `#${queueCount.toLocaleString('pt-BR')}`;
    }

    // Close waitlist modal if open
    if (waitlistModal.open) {
      waitlistModal.close();
    }

    // Open Success Modal
    if (successModal) {
      successModal.showModal();
    }
  }

  if (bottomForm) {
    bottomForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('waitlist-email-bottom');
      if (emailInput) {
        handleWaitlistJoin(emailInput.value);
        emailInput.value = '';
      }
    });
  }

  if (modalForm) {
    modalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('waitlist-name-modal');
      const emailInput = document.getElementById('waitlist-email-modal');
      if (emailInput && nameInput) {
        handleWaitlistJoin(emailInput.value, nameInput.value);
        modalForm.reset();
      }
    });
  }

  // Custom secondary button CTA trigger in Hero
  const secondaryCta = document.getElementById('hero-secondary-cta');
  if (secondaryCta) {
    secondaryCta.addEventListener('click', () => {
      if (demoVideoModal) {
        demoVideoModal.showModal();
      }
    });
  }
}

/* ==========================================
   2. Interactive Features Switcher (Tabs)
   ========================================== */
function initFeatureTabs() {
  const tabButtons = document.querySelectorAll('.feature-tab-btn');
  const previewPanels = document.querySelectorAll('.preview-panel');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Deactivate all buttons
      tabButtons.forEach(btn => btn.classList.remove('active'));
      
      // Deactivate all panels
      previewPanels.forEach(panel => panel.classList.remove('active'));

      // Activate clicked button
      button.classList.add('active');

      // Activate corresponding panel
      const targetId = button.getAttribute('data-target');
      const targetPanel = document.getElementById(targetId);
      
      if (targetPanel) {
        targetPanel.classList.add('active');
        
        // Reset and trigger progress bar animations if the video panel becomes active
        if (targetId === 'feature-videos') {
          animateVideoProgressBars(targetPanel);
        }
      }
    });
  });

  function animateVideoProgressBars(panel) {
    const fills = panel.querySelectorAll('.progress-fill');
    fills.forEach(fill => {
      const width = fill.style.width;
      fill.style.width = '0';
      setTimeout(() => {
        fill.style.transition = 'width 1s ease-out';
        fill.style.width = width;
      }, 50);
    });
  }
}

/* ==========================================
   3. Animated Counters for Social Proof Section
   ========================================== */
function initStatsCounters() {
  const countersBlock = document.getElementById('counters-block');
  const counters = document.querySelectorAll('.counter-number');
  
  if (!countersBlock) return;

  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        counters.forEach(counter => {
          const target = parseInt(counter.getAttribute('data-target') || '0');
          animateCountUp(counter, target);
        });
        animated = true;
      }
    });
  }, { threshold: 0.3 });

  observer.observe(countersBlock);

  function animateCountUp(element, target) {
    const duration = 2000; // 2 seconds
    const startTime = performance.now();
    
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (easeOutQuad)
      const easeProgress = progress * (2 - progress);
      const currentVal = Math.floor(easeProgress * target);
      
      element.textContent = `+${currentVal.toLocaleString('pt-BR')}`;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = `+${target.toLocaleString('pt-BR')}`;
      }
    }

    requestAnimationFrame(update);
  }
}

/* ==========================================
   4. Scroll-Driven Animations Fallback
   ========================================== */
function initScrollAnimationsFallback() {
  // Check if browser natively supports scroll-driven timelines
  const supportsSDA = CSS.supports('(animation-timeline: view()) and (animation-range: entry)');

  if (!supportsSDA) {
    const animatedElements = document.querySelectorAll(
      '.problems-grid > *, .solution-text-block, .solution-visual-block, .interactive-features-block, .video-player-container, .metrics-counters-grid > *, .testimonials-slider > *, .faq-item, .storytelling-container'
    );

    // Apply baseline styles for elements before they scroll into view
    animatedElements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    });

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          // Unobserve once revealed to keep pages light
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px' // Trigger slightly before element reaches viewport center
    });

    animatedElements.forEach(el => revealObserver.observe(el));
  }
}

/* ==========================================
   5. Interactive Video Demo (Simulated Tour)
   ========================================== */
function initDemoTour() {
  const videoModal = document.getElementById('demo-video-modal');
  const renderContainer = document.getElementById('tour-step-render');
  const timerDisplay = document.getElementById('tour-timer-display');
  const prevBtn = document.getElementById('tour-prev-btn');
  const nextBtn = document.getElementById('tour-next-btn');
  const bulletsContainer = document.getElementById('tour-bullets-container');

  const tourSteps = [
    {
      title: "Seu Dashboard de Voo",
      icon: "📊",
      description: "Ao conectar sua conta, o painel do Foguete carrega o seu Score de Perfil com a saúde de conteúdo, engajamento médio e alertas de restrições.",
      contentHtml: `
        <div class="step-slide-layout">
          <div class="step-title-row">
            <span class="step-num-badge">Passo 1/4</span>
            <h4>Painel Principal</h4>
          </div>
          <div class="step-content-box">
            <div style="font-family: monospace; font-size: 0.75rem; color: #60a5fa; margin-bottom: 8px;">
              > SCANNING: @suacontacriador... done.<br>
              > ANALYZING: 30 vídeos carregados.<br>
              > SCORE OBTIDO: <span style="color: #10b981; font-weight: bold;">88/100 (Ótimo)</span>
            </div>
            <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 8px; border-radius: 6px; font-size: 0.7rem; color: var(--color-text-secondary);">
              <strong>Sugestão imediata:</strong> Melhore o gancho visual dos vídeos com menos de 3 segundos de retenção.
            </div>
          </div>
          <p class="step-action-desc">Foguete analisa dados públicos sem expor sua senha.</p>
        </div>
      `
    },
    {
      title: "Análise de Ganchos e Vídeos",
      icon: "🎬",
      description: "Nossa inteligência artificial disseca a estrutura dos seus últimos vídeos públicos para indicar exatamente quais segundos perdem audiência e quais convertem.",
      contentHtml: `
        <div class="step-slide-layout">
          <div class="step-title-row">
            <span class="step-num-badge">Passo 2/4</span>
            <h4>Telemetria de Vídeos</h4>
          </div>
          <div class="step-content-box">
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 6px;">
              <span>Vídeo #08 (Umidificador Led)</span>
              <span style="color: #ef4444;">Retenção Inicial: 42%</span>
            </div>
            <div style="font-size: 0.7rem; color: var(--color-text-secondary); line-height: 1.4;">
              <strong>Diagnóstico Foguete:</strong> O gancho sonoro demorou 4 segundos para aparecer. O recomendável para o algoritmo do TikTok Shop são no máximo 1.8 segundos.
            </div>
          </div>
          <p class="step-action-desc">Saiba exatamente por que seus vídeos não geram cliques no carrinho.</p>
        </div>
      `
    },
    {
      title: "Radar de Oportunidades & Produtos",
      icon: "💡",
      description: "Monitore produtos emergentes com demanda explodindo e analise a margem de lucro, comissão e taxas de cancelamento antes de começar a divulgar.",
      contentHtml: `
        <div class="step-slide-layout">
          <div class="step-title-row">
            <span class="step-num-badge">Passo 3/4</span>
            <h4>Mineração Inteligente</h4>
          </div>
          <div class="step-content-box">
            <div style="background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2); padding: 8px; border-radius: 6px; font-size: 0.75rem; margin-bottom: 6px;">
              <span style="color: #10b981;">🚀 PRODUTO EM ACELERAÇÃO REVELADO:</span><br>
              <strong>Bastão de Maquiagem FPS 50+</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--color-text-secondary);">
              <span>Comissão: 25% (Alta)</span>
              <span>Risco: Baixo</span>
            </div>
          </div>
          <p class="step-action-desc">Encontre produtos vencedores antes da saturação do mercado.</p>
        </div>
      `
    },
    {
      title: "Escudo de Segurança contra Avisos",
      icon: "🛡️",
      description: "O Foguete.Shop monitora preventivamente áudios, logos protegidas e palavras proibidas no seu conteúdo para proteger sua conta contra avisos e suspensão.",
      contentHtml: `
        <div class="step-slide-layout">
          <div class="step-title-row">
            <span class="step-num-badge">Passo 4/4</span>
            <h4>Segurança de Conta</h4>
          </div>
          <div class="step-content-box">
            <div style="background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2); padding: 8px; border-radius: 6px; font-size: 0.75rem; margin-bottom: 6px; color: #ef4444;">
              ⚠️ 1 ALERTA DETECTADO
            </div>
            <div style="font-size: 0.7rem; color: var(--color-text-secondary); line-height: 1.4;">
              Áudio de fundo do vídeo #12 possui restrição comercial no TikTok Shop. Substitua o som para evitar penalizações.
            </div>
          </div>
          <p class="step-action-desc">Fique 100% de acordo com as regras sem esforço.</p>
        </div>
      `
    }
  ];

  let currentStep = 0;
  let timerInterval = null;
  let secondsElapsed = 0;

  function formatTime(secs) {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  }

  function startTimer() {
    secondsElapsed = 0;
    timerDisplay.textContent = "00:00";
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      secondsElapsed++;
      timerDisplay.textContent = formatTime(secondsElapsed);
      if (secondsElapsed >= 80) {
        clearInterval(timerInterval);
      }
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerInterval);
  }

  function renderStep(index) {
    const step = tourSteps[index];
    if (!step) return;

    renderContainer.innerHTML = step.contentHtml;

    // Render bullets
    bulletsContainer.innerHTML = '';
    tourSteps.forEach((_, idx) => {
      const bullet = document.createElement('span');
      bullet.className = `tour-bullet ${idx === index ? 'active' : ''}`;
      bullet.addEventListener('click', () => {
        currentStep = idx;
        renderStep(currentStep);
      });
      bulletsContainer.appendChild(bullet);
    });

    // Toggle button visibilities
    prevBtn.disabled = index === 0;
    if (index === tourSteps.length - 1) {
      nextBtn.textContent = "Concluir Demo";
    } else {
      nextBtn.textContent = "Avançar ►";
    }
  }

  // Event triggers
  const videoTrigger = document.getElementById('video-demo-trigger');
  
  if (videoTrigger && videoModal) {
    videoTrigger.addEventListener('click', () => {
      currentStep = 0;
      renderStep(currentStep);
      startTimer();
    });
  }

  // Watch for dialog close to stop timer
  if (videoModal) {
    videoModal.addEventListener('close', () => {
      stopTimer();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentStep > 0) {
        currentStep--;
        renderStep(currentStep);
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentStep < tourSteps.length - 1) {
        currentStep++;
        renderStep(currentStep);
      } else {
        videoModal.close();
      }
    });
  }
}
