/* ========================================
   AGI Credit - main.js
   Shared logic: Navigation, Forms, Calculator, i18n, Scroll Animations
   ======================================== */

// ==========================================
// NAVIGATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initNotice();
  initNav();
  initScrollAnimations();
  initFAQ();
  initTheme();
  initShowcaseMarquee();
  if (document.getElementById('calc_amount')) initCalculator();
  if (document.getElementById('btn_submit_lead')) initLeadForm();
});

function initNotice() {
  const notice = document.getElementById('site-notice');
  if (!notice) return;

  if (localStorage.getItem('agi-notice-hidden') === 'true') {
    notice.classList.add('is-hidden');
    return;
  }

  const bar = notice.querySelector('.site-notice__bar');
  const close = notice.querySelector('.site-notice__close');

  bar?.addEventListener('click', () => {
    notice.classList.add('is-open');
    bar.setAttribute('aria-expanded', 'true');
  });

  close?.addEventListener('click', (event) => {
    event.stopPropagation();
    notice.classList.add('is-hidden');
    localStorage.setItem('agi-notice-hidden', 'true');
  });
}

function initNav() {
  const header = document.querySelector('.header');
  const mobileToggle = document.querySelector('.mobile-toggle');

  // Sticky header shadow on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 10) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  mobileToggle?.addEventListener('click', () => {
    document.body.classList.toggle('mobile-menu-open');
    const spans = mobileToggle.querySelectorAll('span');
    if (document.body.classList.contains('mobile-menu-open')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });

  // Close mobile menu on link click
  document.querySelectorAll('.nav__link, .nav__dropdown-link').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        document.body.classList.remove('mobile-menu-open');
      }
    });
  });
}

// ==========================================
// THEME SWITCHER
// ==========================================
function initTheme() {
  const themeSwitch = document.getElementById('theme-switch');
  
  // Apply saved theme on load. New visitors see the inverted style by default.
  const savedTheme = localStorage.getItem('agi-theme') || 'inverted';
  if (savedTheme === 'inverted') {
    document.body.classList.add('theme-inverted');
  }
  
  themeSwitch?.addEventListener('click', () => {
    document.body.classList.toggle('theme-inverted');
    const isDark = document.body.classList.contains('theme-inverted');
    localStorage.setItem('agi-theme', isDark ? 'inverted' : 'default');
  });
}

// ==========================================
// HOMEPAGE SHOWCASE MARQUEE
// ==========================================
function initShowcaseMarquee() {
  const marquee = document.getElementById('showcase-marquee');
  if (!marquee) return;

  const slides = Array.from(marquee.querySelectorAll('.showcase-marquee__slide'));
  const dots = Array.from(marquee.querySelectorAll('.showcase-marquee__dots span'));
  if (slides.length < 2) return;

  const slideImages = slides.map(slide => {
    const image = slide.querySelector('img');
    const caption = slide.querySelector('.showcase-marquee__caption strong');
    return {
      src: image?.getAttribute('src') || '',
      alt: image?.getAttribute('alt') || '',
      caption: caption?.textContent?.trim() || image?.getAttribute('alt') || ''
    };
  });

  if (marquee.closest('.showcase-marquee--ribbon')) {
    initRibbonMarquee(marquee, slideImages, dots);
    return;
  }

  if (marquee.closest('.showcase-marquee--ticker')) {
    initTickerMarquee(marquee, slideImages);
    return;
  }

  slides.forEach((slide, index) => {
    const image = slide.querySelector('img');
    if (image?.getAttribute('src')) {
      slide.style.setProperty('--marquee-image', `url("${image.getAttribute('src')}")`);
    }
    if (!slide.querySelector('.showcase-marquee__gallery')) {
      const gallery = document.createElement('div');
      gallery.className = 'showcase-marquee__gallery';
      [
        { offset: -1, className: 'is-side is-prev' },
        { offset: 0, className: 'is-main' },
        { offset: 1, className: 'is-side is-next' }
      ].forEach(({ offset, className }) => {
        const item = slideImages[(index + offset + slideImages.length) % slideImages.length];
        const galleryImage = document.createElement('img');
        galleryImage.src = item.src;
        galleryImage.alt = item.alt;
        galleryImage.className = `showcase-marquee__gallery-img ${className}`;
        gallery.appendChild(galleryImage);
      });
      slide.insertBefore(gallery, slide.querySelector('.showcase-marquee__shade'));
    }
  });

  let current = slides.findIndex(slide => slide.classList.contains('active'));
  if (current < 0) current = 0;
  let timer;
  let leavingTimer;

  const showSlide = (next) => {
    const previous = current;
    window.clearTimeout(leavingTimer);
    slides.forEach(slide => slide.classList.remove('leaving'));
    slides[previous].classList.add('leaving');
    slides[previous].classList.remove('active');
    dots[current]?.classList.remove('active');
    current = next % slides.length;
    slides[current].classList.add('active');
    dots[current]?.classList.add('active');
    leavingTimer = window.setTimeout(() => {
      slides[previous].classList.remove('leaving');
    }, 950);
  };

  const start = () => {
    window.clearInterval(timer);
    timer = window.setInterval(() => showSlide(current + 1), 3000);
  };

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      showSlide(index);
      start();
    });
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      window.clearInterval(timer);
    } else {
      start();
    }
  });

  start();
}

function initRibbonMarquee(marquee, slideImages, dots) {
  const ribbon = document.createElement('div');
  ribbon.className = 'showcase-ribbon';
  const track = document.createElement('div');
  track.className = 'showcase-ribbon__track';
  const caption = document.createElement('div');
  caption.className = 'showcase-ribbon__caption';

  const repeatedImages = [...slideImages, ...slideImages, ...slideImages];
  repeatedImages.forEach((item, renderedIndex) => {
    const cell = document.createElement('div');
    cell.className = 'showcase-ribbon__item';
    cell.dataset.sourceIndex = String(renderedIndex % slideImages.length);
    const image = document.createElement('img');
    image.src = item.src;
    image.alt = item.alt;
    cell.appendChild(image);
    track.appendChild(cell);
  });

  ribbon.appendChild(track);
  marquee.insertBefore(ribbon, marquee.firstElementChild);
  marquee.appendChild(caption);

  const items = Array.from(track.querySelectorAll('.showcase-ribbon__item'));
  let position = slideImages.length;
  let timer;
  let transitionTimer;

  const setPosition = (animate = true) => {
    const item = items[position];
    if (!item) return;
    track.style.transition = animate ? 'transform 1s cubic-bezier(0.22, 1, 0.36, 1)' : 'none';
    const offset = item.offsetLeft + item.offsetWidth / 2 - marquee.clientWidth / 2;
    track.style.transform = `translateX(${-offset}px)`;

    items.forEach(cell => cell.classList.remove('is-center'));
    item.classList.add('is-center');

    const sourceIndex = Number(item.dataset.sourceIndex || 0);
    dots.forEach(dot => dot.classList.remove('active'));
    dots[sourceIndex]?.classList.add('active');
    caption.classList.remove('is-changing');
    caption.textContent = slideImages[sourceIndex]?.caption || '';
  };

  const normalizePosition = () => {
    if (position >= slideImages.length * 2) {
      position = slideImages.length;
      setPosition(false);
    } else if (position < slideImages.length) {
      position = slideImages.length * 2 - 1;
      setPosition(false);
    }
  };

  const moveNext = () => {
    caption.classList.add('is-changing');
    window.clearTimeout(transitionTimer);
    transitionTimer = window.setTimeout(() => {
      position += 1;
      setPosition(true);
      window.setTimeout(normalizePosition, 1020);
    }, 140);
  };

  const start = () => {
    window.clearInterval(timer);
    timer = window.setInterval(moveNext, 4000);
  };

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      position = slideImages.length + index;
      setPosition(true);
      start();
    });
  });

  window.addEventListener('resize', () => setPosition(false));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      window.clearInterval(timer);
    } else {
      start();
    }
  });

  requestAnimationFrame(() => {
    setPosition(false);
    start();
  });
}

function initTickerMarquee(marquee, slideImages) {
  const ticker = document.createElement('div');
  ticker.className = 'showcase-ticker';
  const track = document.createElement('div');
  track.className = 'showcase-ticker__track';

  [...slideImages, ...slideImages].forEach((item) => {
    const cell = document.createElement('div');
    cell.className = 'showcase-ticker__item';
    const image = document.createElement('img');
    image.src = item.src;
    image.alt = item.alt;
    cell.appendChild(image);
    track.appendChild(cell);
  });

  ticker.appendChild(track);
  marquee.insertBefore(ticker, marquee.firstElementChild);
}

// ==========================================
// i18n (Internationalization)
// ==========================================
const translations = {
  'zh-hk': {
    // Nav
    'nav.products': '貸款產品',
    'nav.tools': '貸款工具',
    'nav.faq': '常見問題',
    'nav.contact': '關於我們',
    'nav.news': '財務資訊',
    'nav.apply': '立即申請',
    // Products
    'product.first_mortgage': '一按',
    'product.second_mortgage': '二按',
    'product.refinance': '七折 轉案',
    'product.equity_cashout': '加按 套現',
    'product.owner_loan': '公司業主 LTV 95%',
    'product.sme_loan': 'SME中小企貸款',
    'product.tax_loan': '單邊契3日 Draw',
    'product.owner_p_loan': '業主P LOAN',
    'product.clear_card': '清卡數',
    'product.backup_credit': '備用信貸額@唔用唔計利息',
    // Product details specific
    'product.first_mortgage_badge': '大額週轉首選 · 不限物業種類',
    'product.first_mortgage_subtitle': '將名下未抵押的物業作為第一抵押物，獲取超大額度的流動資金。我們提供靈活的還款方案，不限樓齡與物業類型，助您輕鬆盤活資產。',
    'product.second_mortgage_badge': '免經銀行 · 靈活提現',
    'product.second_mortgage_subtitle': '在物業已有一按的基礎上，將剩餘價值再次抵押以獲取備用現金。無需一按銀行同意，登記手續特快，助您迅速調配資金，抓緊投資先機。',
    'product.refinance_badge': '清還高息債務 · 重置財務生活',
    'product.refinance_subtitle': '將原有的高息二按、信用卡卡數、私人貸款等，重新轉按為一筆過低息一按，大幅延長還款期，節省利息開支，每月供款最多可減輕高達 60%！',
    'product.equity_cashout_badge': '資產增值 · 活化套現',
    'product.equity_cashout_subtitle': '將已隨市場升值的物業進行加按套現，以低成本提取大量現金。將固定資產變為靈活的流動資產，用於擴張生意、再投資理財或家庭大額支出，實現「錢生錢」。',
    'product.owner_loan_badge': '無需抵押登記 · 業主專享大額',
    'product.owner_loan_subtitle': '專為物業持有者（業主）設計的無抵押私人貸款。無需提供樓契，不用做任何田土廳物業抵押登記，僅憑您的業主身份即可快速借足高達 150 萬元，享受極速便利的備用現金流。',
    'product.sme_loan_badge': '特快審批 · 助商企開拓生機',
    'product.sme_loan_subtitle': '為本港中小企業提供敏捷的流動性支持。不論是用於進貨採購、交稅、支付租金、出糧，還是緊急捕捉市場商機，我們均能以高效率的 AI 審批在 24 小時內發放高達 1000 萬的周轉資金。',
    'product.tax_loan_badge': '稅季專屬 · 低息利民',
    'product.tax_loan_subtitle': '每年稅季，稅單如期而至。無論是個人薪俸稅、還是公司利得稅，我們提供專門的低息税貸方案，年利率低至 4.5% 起，貸款額高達 200 萬，還款期靈活，助您輕鬆應對稅務開支，保障現金周轉。',
    'product.first_mortgage_desc': '最高貸款額3000萬，成數高達9成，利息低至5.8%，最長120個月。',
    'product.second_mortgage_desc': '無需一按銀行同意，額度高達1,000萬，極速審批放款。',
    'product.refinance_desc': '清卡數、降息重組，將高息債務整合為低息物業貸款。',
    'product.equity_cashout_desc': '低息樓按錢生錢，將物業升值部分轉化為流動資金。',
    'product.owner_loan_desc': '無需質押樓契，憑業主身份即享備用信貸額度。',
    'product.sme_loan_desc': '利息低、審批快、還款活，解決企業緊急周轉。',
    'product.tax_loan_desc': '單邊契快速提款，3日內完成資金安排，應對緊急周轉。',
    'product.owner_p_loan_desc': '業主專屬私人貸款，免繁複按揭流程，快速調配家庭或生意周轉。',
    'product.clear_card_desc': '整合信用卡及高息債務，降低每月還款壓力，重整現金流。',
    'product.backup_credit_desc': '先批核備用額度，需要時即用；未動用部分不計利息。',
    // Tools
    'tool.calculator': '貸款計算器',
    'tool.affordability': '負擔能力評估',
    'tool.valuation': '物業估價',
    // Form
    'form.title': '⚡ 極速申請',
    'form.loan_amount': '貸款金額 (HK$)',
    'form.loan_category': '貸款類別',
    'form.loan_term': '還款期',
    'form.phone': '手機號碼',
    'form.terms': '我已閱讀並同意',
    'form.terms_link': '貸款申請條款',
    'form.privacy': '及',
    'form.privacy_link': '私隱政策',
    'form.marketing': '同意接收推廣資訊',
    'form.submit': '立即申請',
    'form.select_category': '貸款類別',
    'form.select_term': '還款期',
    'term.1': '1 個月',
    'term.3': '3 個月',
    'term.6': '6 個月',
    'term.12': '12 個月',
    'term.24': '24 個月',
    'term.36': '36 個月',
    'term.60': '60 個月',
    'term.120': '120 個月',
    // Calculator
    'calc.title': '貸款計算器',
    'calc.amount': '貸款金額',
    'calc.rate': '年利率',
    'calc.term': '還款期（月）',
    'calc.type': '還款方式',
    'calc.type_pi': '本息償還',
    'calc.type_io': '先息後本',
    'calc.monthly': '每月還款額',
    'calc.total_interest': '利息總支出',
    'calc.total_repay': '還款總額',
    'calc.apply_now': '以此方案申請',
    'calc.hero_badge': '科學規劃 · 運籌帷幄',
    'calc.hero_desc': '我們為您提供兩種主流還款模式的在線測算工具。不論是「本金與利息一同償還」，還是「先供息、最後歸還本金」，只需輸入金額、年利率及期限，AI 即可為您精確展示財務明細。',
    'calc.start_btn': '開始計算',
    'calc.exp_title': '瞭解兩種還款方式的區別',
    'calc.exp_pi_desc': '1. 本息償還法 (Principal & Interest - P&I)：這是最普遍的還款方式。每月供款額固定，包含部分本金和當期利息。初期還利息比例較高，後期本金比例逐漸上升，利息總支出較少。',
    'calc.exp_io_desc': '2. 先息後本法 (Interest-Only - IO)：在還款期內，每月只支付利息，不償還本金。直到最後一期才一次過歸還全部貸款本金。適合短期靈活周轉，能大幅降低前期的供款壓力，但利息總支出會更高。',
    // Hero
    'hero.badge': 'Full Stack AI 持牌金融機構',
    'hero.title_1': '一按大，',
    'hero.title_2': '二按快',
    'hero.subtitle': '3分鐘批核，最快3小時現金到手',
    'hero.stat_1_value': '3000萬',
    'hero.stat_1_label': '最高貸款額',
    'hero.stat_2_value': '9成',
    'hero.stat_2_label': '最高成數',
    'hero.stat_3_value': '5.8%',
    'hero.stat_3_label': '最低利率',
    'hero.stat_4_value': '3小時',
    'hero.stat_4_label': '極速放款',
    'marquee.slide1': '一按大，二按快',
    'marquee.slide2': '靈活解鎖物業價值',
    'marquee.slide3': '快人一步完成審批',
    'marquee.slide4': '把握資金黃金時間',
    'marquee.slide5': '把壓力整合成清晰方案',
    'marquee.slide6': '用低息方案重整卡數',
    'marquee.slide7': '讓還款節奏重新可控',
    'marquee.slide8': '重整資金，重新出發',
    'marquee.slide9': '讓計劃準時起飛',
    'marquee.slide10': '抓住稍縱即逝的機會',
    'marquee.slide11': '用專業建立可靠合作',
    'marquee.slide12': '讓資金安排穩步向上',
    'marquee.slide13': '以速度回應每個關鍵時刻',
    'marquee.slide14': '安全核驗，審批更安心',
    'marquee.slide15': '智能風控守住每一步',
    'marquee.slide16': '在關鍵時刻給您支援',
    'marquee.slide17': '為更大的目標補足力量',
    // Process
    'process.title': '申請流程',
    'process.subtitle': '簡單四步，極速獲取資金',
    'process.step1': '網上申請',
    'process.step1_desc': '1分鐘填寫基本資料',
    'process.step2': '提交文件',
    'process.step2_desc': '上傳所需資料',
    'process.step3': '快速審批',
    'process.step3_desc': '15分鐘初步審核',
    'process.step4': '極速放款',
    'process.step4_desc': '最快3小時過數',
    // Products Section
    'products.title': '貸款產品',
    'products.subtitle': '多元化信貸方案，滿足不同資金需求',
    'product.learn_more': '了解更多',
    // Pain
    'pain.title': '資金困難？我們幫到你！',
    'pain.item1': '卡數纏身，利息越滾越大？',
    'pain.item2': '生意周轉急需資金？',
    'pain.item3': '銀行審批太慢，等不及？',
    'pain.item4': '物業有價，但現金不足？',
    'pain.cta': '免費諮詢',
    // Stats
    'stats.clients': '服務客戶',
    'stats.amount': '累計放款',
    'stats.rate': '批核率',
    'stats.speed': '平均放款',
    // Footer
    'footer.products': '貸款產品',
    'footer.tools': '貸款工具',
    'footer.about': '關於我們',
    'footer.about_us': '公司介紹',
    'footer.contact': '關於我們',
    'footer.terms': '條款及私隱',
    'footer.disclaimer': '投訴熱線: 6106 9997　忠告: 借錢梗要還，咪俾錢中介',
    'footer.copyright': '© 2026 AGI Credit 智通金融科技。版權所有。',
    // FAQ
    'faq.title': '常見問題',
    'faq.subtitle': '解答您的疑問',
    'faq.hero_badge': '財務傘護 · 疑難解答',
    // Contact
    'contact.title': '關於我們',
    'contact.subtitle': '我們的專業顧問隨時為您服務',
    'contact.phone': '客服熱線',
    'contact.whatsapp': 'WhatsApp',
    'contact.email': '電郵地址',
    'contact.address': '辦公地址',
    'contact.hours': '營業時間',
    'contact.form_title': '在線留言',
    'contact.name': '您的姓名',
    'contact.message': '留言內容',
    'contact.send': '發送留言',
    'contact.hero_badge': '專業顧問 · 隨時待命',
    'about.title': '關於我們',
    'about.p1': '我們專注於財務信貸業務，致力以全端全人工智能 Full Stack AI 金融科技顛覆傳統信貸流程。',
    'about.p2': '承襲集團扎根香港50年的深厚物業市場人脈與數據積澱，我們將數十年的物業估值經驗完美融合於自研的 AI 系統中。透過全自動化數據分析，我們不僅精準掌握香港物業市場的實時脈搏，更能實現秒速精確估值。',
    'about.p3': '正因為我們全面推行AI 驅動的數智化營運體系，成功大幅降低營運成本，並將這些科技紅利直接回饋客戶，為您提供更低息、更高效、更具競爭力的貸款方案。',
    'contact.info_title': '聯絡資訊',
    'contact.address_val': '香港中環德輔道中 19 號環球大廈 28 樓 2801 室',
    'contact.hours_val': '星期一至五: 09:00 - 18:00 (公眾假期除外)',
    'contact.family_title': '為了家人的幸福，為您解決財務難題',
    'contact.family_desc': '我們知道每一次貸款申請的背後，都是對家庭的一份責任。不論是裝修新居、生意運作，還是幫助子女升學，我們都將以最合理、最溫暖的方式為您提供支持，讓您的家始終充滿溫馨與歡笑定位。',
    // Terms
    'terms.title': '條款及私隱政策',
    'terms.hero_badge': '合規經營 · 誠信至上',
    // Modal
    'modal.success_title': '申請已提交！',
    'modal.success_text': '我們的客戶經理將在15分鐘內透過電話或WhatsApp與您聯絡。',
    'modal.ok': '確認',
    // Months
    'months': '個月',
    // Common
    'max_amount': '最高貸款額',
    'max_ltv': '最高成數',
    'min_rate': '最低利率',
    'max_term': '最長期限',
    // Compare table
    'compare.title': '本公司與傳統銀行比較',
    'compare.subtitle': '智能化審批，助您免去繁瑣程序，資金極速到手',
    'compare.metric': '比較項目',
    'compare.bank': '傳統銀行',
    'compare.agi': 'AGI Credit 智通金融科技',
    'compare.amount': '最高貸款額',
    'compare.amount_bank': '受限於月薪，通常最高十多倍，或嚴格看成數限制',
    'compare.amount_agi': '最高3000萬港元，主要評估物業估值',
    'compare.speed': '審批時間',
    'compare.speed_bank': '通常需時 2 至 4 星期',
    'compare.speed_agi': '最快3分鐘批核，3小時放款過數',
    'compare.docs': '所需文件',
    'compare.docs_bank': '極為繁複，需要完整的稅單、強積金、入息證明',
    'compare.docs_agi': '簡單便捷，無須繁瑣入息證明，免壓力測試',
    'compare.property': '物業限制',
    'compare.property_bank': '不接受唐樓、村屋、商舖、車位或老舊物業',
    'compare.property_agi': '接受唐樓、村屋、商舖、車位、舊樓等多種類型',
    'faq.q1': '申請物業按揭貸款需要收費嗎？',
    'faq.a1': '我們所有的諮詢、物業估價及申請評估服務都是完全免費的。如果您的貸款沒有獲批或最終沒有簽署合同，我們不會收取任何費用。在合同簽署前，我們也會向您明示所有利息及相關手續費用，保證透明。',
    'faq.q2': '信貸評級 (TU) 較差是否會影響申請？',
    'faq.a2': '與傳統銀行不同，我們作為持牌非銀行金融機構，擁有靈活的 AI 審批機制。我們不單看您的 TU 信貸評級，更關注您目前的物業剩餘價值以及實際還款能力。因此，即使 TU 評級不佳，您依然有極大機會獲得批核。',
    'faq.q3': '最快可以多久拿到貸款現金？',
    'faq.a3': '在您提交齊全的申請文件（身份證、樓契/按揭供款記錄、流水賬單等）後，我們的 AI 評估系統最快能在 15 分鐘之內給出初步批核額度及利率。在雙方簽署法律文件並完成必要手續後，貸款最快可於 24 小時內過數至您的賬戶。',
    'faq.q4': '我可以隨時提前還款嗎？有罰息期嗎？',
    'faq.a4': '可以。我們提供高度彈性的還款計劃。在合約規定的框架內，您可隨時申請提前部分或全部還款。我們不設苛刻的罰息條款，詳細的提前還款細則會在簽署合約前向您逐一解釋清楚。',
    'faq.q5': '如果我的物業是與家人聯名持有，我能單獨借貸嗎？',
    'faq.a5': '如果您申請的是「公司業主 LTV 95%」這類私人貸款，只要您能證明物業所有權，即可由您個人單獨申請，無須聯名持有人簽署。但如果您申請的是大額「物業一按或二按」抵押貸款，由於需要辦理合規的物業權益登記，通常需要所有聯名持有人共同出席並簽署相關文件。',
    'terms.subtitle': '我們嚴格遵守香港特別行政區相關法律法規，採取高標準的數據加密與隱私保護措施，保障您在申請貸款過程中的個人信息安全。',
    'terms.section1_title': '1. 私隱政策與個人資料收集聲明',
    'terms.section1_p1': 'AGI Credit 智通金融科技（下稱「本公司」或「我們」）致力於保障及維護客戶的個人資料私隱。我們將確保在收集、使用、保留、披露、轉移、保安及查閱個人資料時，嚴格遵守香港法例第 486 章《個人資料（私隱）條例》的規定。',
    'terms.section1_p2': '當您使用本網站的快速貸款申請表或留言諮詢時，我們可能會收集您的個人資料，包括但不限於您的姓名、電話號碼、期望貸款金額及類別。該等資料將僅用於：',
    'terms.section1_li1': '評估及處理您的貸款申請，進行初步資信核驗；',
    'terms.section1_li2': '回應您的查詢，聯絡您並提供相關財務顧問服務；',
    'terms.section1_li3': '在獲得您明確同意的情況下，向您發送本公司的最新推廣活動及直銷資訊；',
    'terms.section1_li4': '履行任何適用法律及持牌財務公司守則下的合規審計及申報義務。',
    'terms.section2_title': '2. 貸款申請服務條款及細則',
    'terms.section2_p1': '在使用本網站提交貸款申請意向時，您必須聲明並保證：',
    'terms.section2_li1': '您所提供的所有個人資料、聯繫方式以及期望貸款額度均是真實、準確且無誤的；',
    'terms.section2_li2': '您提交此申請代表您正式授權本公司的客戶服務代表或信貸經理，在收到資料後透過您所填寫的手機號碼（包括撥打電話、發送簡訊及通過 WhatsApp）與您取得聯絡並跟進後續批核事宜；',
    'terms.section2_li3': '本網站提供的初步測算結果（如計算器得出的月供等）僅供參考，不構成任何正式的貸款承諾。最終批核額度、利率及條款將以您最終簽署的法律合約為準。',
    'terms.section3_title': '3. 直銷推廣及市場調查同意聲明',
    'terms.section3_p1': '本公司希望在獲得您的同意後，使用您的個人聯絡資料進行直銷。我們可能會向您發送關於物業按揭、二按、私人信貸、結餘轉戶及稅務貸款等產品的優惠推廣資訊。如果您不希望接收此類直銷信息，您可以在填寫表單時不勾選「同意接收推廣資訊」，或在日後隨時致電我們的客服熱線取消訂閱。',
    'terms.section4_title': '4. 放債人條例警示聲明',
    'calc.subtitle': '拖動滑塊即可實時測算您的每月還款金額及利息開支',
    'equity_cashout.val_1': '釋放物業升值額',
    'equity_cashout.lbl_1': '主要功能',
    'equity_cashout.target_title': '適合對象',
    'equity_cashout.target_1': '持有的物業在近幾年大幅升值，希望提取溢價資金的業主',
    'equity_cashout.target_2': '希望獲取低成本（年息5.8%起）資金進行生意投資、再買房或理財的業主',
    'equity_cashout.target_3': '有裝修、子女升學、婚禮等大額現金消費需求的家庭',
    'equity_cashout.docs_title': '所需文件',
    'equity_cashout.docs_1': '香港身份證 / 護照',
    'equity_cashout.docs_2': '最近三個月的住址證明',
    'equity_cashout.docs_3': '原物業按揭貸款供款表及近三個月供款單',
    'equity_cashout.docs_4': '最近三個月的銀行流水及資產證明（如適用）',
    'equity_cashout.faq_q1': '什麼是「物業加按」？',
    'equity_cashout.faq_a1': '加按（Top-up）是指在不改變原本按揭機構（如銀行）的情況下，向原機構申請增加按揭金額；或者通過轉按至新機構，提取已升值部分的差額。套現資金完全由您自由支配。',
    'equity_cashout.faq_q2': '物業估值如何影響套現額度？',
    'equity_cashout.faq_a2': '物業最新市值越高，可套取的資金就越多。例如，物業原價 600 萬，現升值至 1000 萬，按 8 成成數計算，可貸額度增至 800 萬。扣除一按餘額後，剩餘的數百萬差額即可套取出現金。',
    'first_mortgage.val_1': 'HK$ 3000萬',
    'first_mortgage.val_2': '高達 9 成',
    'first_mortgage.val_3': '低至 5.8%',
    'first_mortgage.val_4': '長達 120期',
    'first_mortgage.target_title': '適合對象',
    'first_mortgage.target_1': '名下持有未抵押物業，急需大額週轉資金的業主',
    'first_mortgage.target_2': '需要靈活營運資金進行擴張或進貨的中小企業主',
    'first_mortgage.target_3': '無法提供常規收入證明，或受限於銀行信貸評級的借款人',
    'first_mortgage.target_4': '物業類型特殊（如村屋、商舖、舊唐樓等）被銀行拒收者',
    'first_mortgage.docs_title': '所需文件',
    'first_mortgage.docs_1': '香港身份證 / 護照',
    'first_mortgage.docs_2': '最近三個月的住址證明（如水電費單或銀行賬單）',
    'first_mortgage.docs_3': '物業樓契或最新估價資料',
    'first_mortgage.docs_4': '最近三個月的銀行流水賬單（如適用）',
    'first_mortgage.faq_q1': '什麼是「一按」？它與二按有什麼分別？',
    'first_mortgage.faq_a1': '「一按」是指借款人將未抵押的物業作為第一順位抵押物向我們申請貸款；「二按」是在該物業已有第一抵押（通常是銀行按揭）的情況下，將剩餘價值再次抵押給我們。一按的貸款額度更大、利率更低。',
    'first_mortgage.faq_q2': '哪些類型的物業可以申請一按？舊唐樓、村屋可以嗎？',
    'first_mortgage.faq_a2': '可以。相對於傳統銀行，我們的審批標準更為寬鬆。不論是普通住宅、豪宅、唐樓、村屋、寫字樓、商舖、車位，甚至是不完整業權的物業，我們均可接受申請並予以快速估價。',
    'first_mortgage.faq_q3': '沒有常規入息證明，可以申請一按嗎？',
    'first_mortgage.faq_a3': '可以。我們更注重物業本身的市場估值及借款人的實際財務需求。即使您是自僱人士、自由職業者、無固定收入者或信貸評級不理想，我們的專業團隊也會為您度身定制合適的信貸方案。',
    'first_mortgage.faq_q4': '一按貸款的最快放款時間是多久？',
    'first_mortgage.faq_a4': '在您提交齊全的文件資料後，我們最快可在 15 分鐘之內完成初步評估，並在簽署合約後的 24 小時之內將貸款發放至您的指定賬戶。',
    'owner_loan.val_1': 'HK$ 150萬',
    'owner_loan.val_2': '免收樓契/免抵押',
    'owner_loan.lbl_2': '質押條件',
    'owner_loan.val_3': '低至 8%',
    'owner_loan.val_4': '長達 60期',
    'owner_loan.target_title': '適合對象',
    'owner_loan.target_1': '手頭持有物業（如居屋、私樓、村屋等），但不想將物業進行正式抵押登記的業主',
    'owner_loan.target_2': '樓契不在手頭（如仍在銀行辦理按揭中）的業主',
    'owner_loan.target_3': '急需小額至中額現金，且希望審批手續比物業按揭更為快速簡單的客戶',
    'owner_loan.docs_title': '所需文件',
    'owner_loan.docs_1': '香港身份證',
    'owner_loan.docs_2': '物業持有權證明（如差餉單、水電費單或供樓記錄）',
    'owner_loan.docs_3': '最近三個月的個人銀行賬戶流水（如適用）',
    'owner_loan.faq_q1': '為什麼叫「免樓契」業主貸？不需要交樓契嗎？',
    'owner_loan.faq_a1': '是的。傳統物業按揭貸款需要將「樓契」質押給貸款機構並辦理田土廳抵押登記（俗稱钉契）。而本計劃純粹是專門針對業主設計的特快私人信貸，我們不押契、不釘契，借款手續極為簡化。',
    'owner_loan.faq_q2': '聯名持有物業，可以單獨申請公司業主 LTV 95%嗎？',
    'owner_loan.faq_a2': '可以。如果您名下的物業是聯名持有的（例如夫妻雙方聯名或家人共持），只要您個人有實際財務周轉需求，您就可以業主之一的身份單獨向我們提出申請，無須其他聯名人簽字或同意。',
    'refinance.val_1': '減息高達 50%',
    'refinance.lbl_1': '利息節省空間',
    'refinance.val_2': '高達 8 成',
    'refinance.debt_title': '多筆債務壓身？卡數利息滾雪球？',
    'refinance.debt_desc': '信用卡最低還款額（Min Pay）實際年利率（APR）往往高達 30% 以上。若只還 Min Pay，債務可能滾幾十年也無法清還！透過我們的「物業轉按/結餘轉戶」計劃，把所有散亂的高息債務整合為單一低息物业貸款，利息大幅降至6%起，讓您輕鬆告別滾雪球式債務。',
    'refinance.pain_1': '整合散亂信用卡債、私人貸款為單一月供',
    'refinance.pain_2': '利息支出大幅減少，拒絕高達30%的卡債年息',
    'refinance.pain_3': '還款期重新拉長，顯著改善每月家庭現金流',
    'refinance.target_title': '適合對象',
    'refinance.target_1': '信用卡長期拖欠、卡數高企，飽受高息折磨的業主',
    'refinance.target_2': '在多間財務公司持有高息私人貸款或高息二按的客戶',
    'refinance.target_3': '現有按揭利息偏高，希望轉到更優惠低息平台的業主',
    'refinance.docs_title': '所需文件',
    'refinance.docs_1': '香港身份證',
    'refinance.docs_2': '最近三個月的所有信用卡及私人貸款月結單',
    'refinance.docs_3': '原按揭銀行或財務公司的供款記錄/合約',
    'refinance.docs_4': '最近三個月的住址證明及銀行流水賬單',
    'refinance.faq_q1': '什麼是「結餘轉戶 / 轉按清數」？',
    'refinance.faq_a1': '這是指利用物業剩餘的按揭空間，向我們申請一筆低息按揭，直接清還您名下所有的信用卡欠款（卡數）、高息私人貸款等。整合後，多筆債務變為單一供款，利息支出大幅降低，月供更為輕鬆。',
    'refinance.faq_q2': '轉按是否可以套取額外現金？',
    'refinance.faq_a2': '可以。在轉按過程中，如果您的物業在近幾年已經升值，除清還原按揭和債務外，剩餘的溢價部分亦可一併申請套取額外的現金，作靈活周轉或個人投資用途。',
    'refinance.faq_q3': '轉按需要支付高額手續費或律師費嗎？',
    'refinance.faq_a3': '我們所有的費用均透明合理。在初步諮詢與估價階段是完全免費的。若成功批核，相關費用與律師登記費會事先在合同中列明，通常可以直接從貸款額中扣除，您無須提前支付額外開支。',
    'second_mortgage.val_1': 'HK$ 1,000萬',
    'second_mortgage.val_2': '免經一按銀行',
    'second_mortgage.lbl_2': '辦理條件',
    'second_mortgage.val_3': '低至 12%',
    'second_mortgage.val_4': '長達 120期',
    'second_mortgage.target_title': '適合對象',
    'second_mortgage.target_1': '物業已有一按（如銀行按揭），急需額外週轉金且不願動用一按的業主',
    'second_mortgage.target_2': '希望免去一按銀行同意手續，簡化審批程序的借款人',
    'second_mortgage.target_3': '急需在極短時間（如3小時內）獲取資金進行短期周轉的客戶',
    'second_mortgage.docs_title': '所需文件',
    'second_mortgage.docs_1': '香港身份證 / 護照',
    'second_mortgage.docs_2': '一按銀行的供款表及最新供樓記錄',
    'second_mortgage.docs_3': '最近三個月的住址證明（如水電費單）',
    'second_mortgage.docs_4': '最近三個月的銀行賬戶流水賬單',
    'second_mortgage.faq_q1': '物業二按是否真的不需要通知一按銀行同意？',
    'second_mortgage.faq_a1': '是的。我們的二按核心賣點之一就是「免經銀行同意」。我們有一套獨立的評估與登記程序，因此不需要耗費漫長時間去向您的一按銀行申請同意書，從而極大地加快了貸款辦理速度。',
    'second_mortgage.faq_q2': '二按的最高成數如何計算？',
    'second_mortgage.faq_a2': '二按成數取決於物業目前的最新市場估值與您一按按揭的尚欠餘額。一般而言，物業一按加上二按的總貸款成數最高可達物業估值的 8.5 成。',
    'second_mortgage.faq_q3': '如果我的一按正在斷供或有不良記錄，可以申請二按嗎？',
    'second_mortgage.faq_a3': '我們需要評估您的一按欠款及物業權益。即使有短期逾期或信貸記錄瑕疵，我們專業的財務顧問也會盡力協助您進行重組或加按清還，具體情況請直接聯繫我們進行免費個案評估。',
    'sme_loan.val_1': 'HK$ 1,000萬',
    'sme_loan.val_2': '最快 24 小時',
    'sme_loan.val_4': '長達 84期',
    'sme_loan.partner_title': '急您所急，做您最可靠的商業夥伴',
    'sme_loan.partner_desc': '商業經營千變萬化，資金需求往往突如其來。銀行的商業貸款申請手續冗長、要求抵押物繁多，且審批耗時數週甚至數月。我們深明中小企的痛點，以最快的速度、靈活的還款期限和合理的利息，提供全方位支持，助您的企業大展宏圖。',
    'sme_loan.benefit_1': '無需繁冗的公司財務審計報告，免除繁杂文書手續',
    'sme_loan.benefit_2': '利息合理透明，可配合公司現金流進行「先息後本」靈活供款',
    'sme_loan.benefit_3': '支持以公司名義或個人股東名下物業（私樓/商鋪/工廈）作抵押申請',
    'sme_loan.target_title': '適合對象',
    'sme_loan.target_1': '急需大額流動性資金支付貨款、員工薪資、公司交稅的本港中小企業主',
    'sme_loan.target_2': '因業務擴張、裝修或拓展新項目而急需短期資金支持的企業',
    'sme_loan.target_3': '在銀行信貸評級不足或無法取得傳統銀行商業按揭額度的公司',
    'sme_loan.docs_title': '所需文件',
    'sme_loan.docs_1': '公司商業登記證 (BR) 及周年申報表 (NAR1)',
    'sme_loan.docs_2': '董事及大股東的身份證明文件',
    'sme_loan.docs_3': '最近六個月的公司銀行流水賬單',
    'sme_loan.docs_4': '相關物業資料證明（如用作物業抵押登記）',
    'sme_loan.faq_q1': '中小企貸款是否必須提供房屋抵押？',
    'sme_loan.faq_a1': '不一定。雖然提供物業（如辦公室、舖位或股東私人房產）作為抵押可以獲得更低的利率和更高的信貸額度，但如果您的企業經營流水表現優異，您亦可申請我們專門設計的無抵押中小企業信用貸。',
    'sme_loan.faq_q2': '我的公司剛成立不久，可以申請商業貸款嗎？',
    'sme_loan.faq_a2': '可以。相對於傳統銀行嚴格要求公司需有 2 至 3 年審計報告和穩定營收，我們的審批更為靈活。只要您的公司在香港合法註冊，且大股東名下持有本港物業，我們均可接受個案申請。',
    'tax_loan.val_1': 'HK$ 200萬',
    'tax_loan.val_3': '低至 4.5%',
    'tax_loan.val_4': '長達 24期',
    'tax_loan.target_title': '適合對象',
    'tax_loan.target_1': '面臨大額薪俸稅交稅壓力的本港居民',
    'tax_loan.target_2': '需要交納公司利得稅、希望保留充足現金流的中小企業主',
    'tax_loan.target_3': '希望享受極低利息（年息4.5%起）的特快貸款客戶',
    'tax_loan.docs_title': '所需文件',
    'tax_loan.docs_1': '香港身份證',
    'tax_loan.docs_2': '稅務局發出的最新稅單 (Tax Demand Note)',
    'tax_loan.docs_3': '最近三個月的住址證明及入息證明',
    'tax_loan.faq_q1': '稅季貸款的還款期最長多久？',
    'tax_loan.faq_a1': '稅季貸款主要是為了解決年度稅款的開支壓力。為了讓您能在下一個稅季到來前清還貸款，我們提供的還款期最長為 24 個月。',
    'tax_loan.faq_q2': '我可以借多於稅單上的應繳稅額嗎？',
    'tax_loan.faq_a2': '可以。只要您的財務狀況及還款能力良好，我們批出的最高稅貸額度可高達您應繳稅款的 2 倍，或者最高 200 萬港元（以較低者為準），讓您有額外現金作靈活支配。',
  },
  'zh-cn': {
    'nav.products': '贷款产品',
    'nav.tools': '贷款工具',
    'nav.faq': '常见问题',
    'nav.contact': '关于我们',
    'nav.news': '财务资讯',
    'nav.apply': '立即申请',
    // Products
    'product.first_mortgage': '一按',
    'product.second_mortgage': '二按',
    'product.refinance': '七折 转案',
    'product.equity_cashout': '加按 套现',
    'product.owner_loan': '公司业主 LTV 95%',
    'product.sme_loan': 'SME中小企贷款',
    'product.tax_loan': '单边契3日 Draw',
    'product.owner_p_loan': '业主P LOAN',
    'product.clear_card': '清卡数',
    'product.backup_credit': '备用信贷额@唔用唔计利息',
    // Product details specific
    'product.first_mortgage_badge': '大额周转首选 · 不限物业种类',
    'product.first_mortgage_subtitle': '将名下未抵押的物业作为第一抵押物，获取超大额度的流动资金。我们提供灵活的还款方案，不限楼龄与物业类型，助您轻松盘活资产。',
    'product.second_mortgage_badge': '免经银行 · 灵活提现',
    'product.second_mortgage_subtitle': '在物业已有第一抵押的基础上，将剩余价值再次抵押以获取备用现金。无需一按银行同意，登记手续特快，助您迅速调配资金，抓紧投资先机。',
    'product.refinance_badge': '清还高息债务 · 重置财务生活',
    'product.refinance_subtitle': '将原有的高息二按、信用卡卡数、私人贷款等，重新转按为一笔过低息一按，大幅延长还款期，节省利息开支，每月供款最多可减轻高达 60%！',
    'product.equity_cashout_badge': '资产增值 · 活化套现',
    'product.equity_cashout_subtitle': '将已随市场升值的物业进行加按套现，以低成本提取大量现金。将固定资产变为灵活的流动资产，用于扩张生意、再投资理财或家庭大额支出，实现“钱生钱”。',
    'product.owner_loan_badge': '无需抵押登记 · 业主专享大额',
    'product.owner_loan_subtitle': '专为物业持有者（业主）设计的无抵押私人贷款。无需提供楼契，不用做任何田土厅物业抵押登记，仅凭您的业主身份即可快速借足高达 150 万元，享受极速便利的备用现金流。',
    'product.sme_loan_badge': '特快审批 · 助商企开拓生机',
    'product.sme_loan_subtitle': '为本港中小企业提供敏捷的流动性支持。不论是用于进货采购、交税、支付租金、发薪，还是紧急捕捉市场商机，我们均能以高效率的 AI 审批在 24 小时内发放高达 1000 万的周转资金。',
    'product.tax_loan_badge': '税季专属 · 低息利民',
    'product.tax_loan_subtitle': '每年税季，税单如期而至。无论是个人薪俸税、还是公司利得税，我们提供专门的低息税贷方案，年利率低至 4.5% 起，贷款额高达 200 万，还款期灵活，助您轻松应对税务开支，保障现金周转。',
    'product.first_mortgage_desc': '最高贷款额3000万，成数高达9成，利息低至5.8%，最长120个月。',
    'product.second_mortgage_desc': '无需一按银行同意，额度高达1,000万，极速审批放款。',
    'product.refinance_desc': '清卡数、降息重组，将高息债务整合为低息物业贷款。',
    'product.equity_cashout_desc': '低息楼按钱生钱，将物业升值部分转化为流动资金。',
    'product.owner_loan_desc': '无需质押楼契，凭业主身份即享备用信贷额度。',
    'product.sme_loan_desc': '利息低、审批快、还款活，解决企业紧急周转。',
    'product.tax_loan_desc': '单边契快速提款，3日内完成资金安排，应对紧急周转。',
    'product.owner_p_loan_desc': '业主专属私人贷款，免繁复按揭流程，快速调配家庭或生意周转。',
    'product.clear_card_desc': '整合信用卡及高息债务，降低每月还款压力，重整现金流。',
    'product.backup_credit_desc': '先批核备用额度，需要时即用；未动用部分不计利息。',
    'tool.calculator': '贷款计算器',
    'tool.affordability': '负担能力评估',
    'tool.valuation': '物业估价',
    'form.title': '⚡ 极速申请',
    'form.loan_amount': '贷款金额 (HK$)',
    'form.loan_category': '贷款类别',
    'form.loan_term': '还款期',
    'form.phone': '手机号码',
    'form.terms': '我已阅读并同意',
    'form.terms_link': '贷款申请条款',
    'form.privacy': '及',
    'form.privacy_link': '隐私政策',
    'form.marketing': '同意接收推广信息',
    'form.submit': '立即申请',
    'form.select_category': '贷款类别',
    'form.select_term': '还款期',
    'term.1': '1 个月',
    'term.3': '3 个月',
    'term.6': '6 个月',
    'term.12': '12 个月',
    'term.24': '24 个月',
    'term.36': '36 个月',
    'term.60': '60 个月',
    'term.120': '120 个月',
    'hero.badge': 'Full Stack AI 持牌金融機構',
    'hero.title_1': '一按大，',
    'hero.title_2': '二按快',
    'hero.subtitle': '3分钟批核，最快3小时现金到手',
    'hero.stat_1_value': '3000万',
    'hero.stat_1_label': '最高贷款额',
    'hero.stat_2_value': '9成',
    'hero.stat_2_label': '最高成数',
    'hero.stat_3_value': '5.8%',
    'hero.stat_3_label': '最低利率',
    'hero.stat_4_value': '3小时',
    'hero.stat_4_label': '极速放款',
    'marquee.slide1': '一按大，二按快',
    'marquee.slide2': '灵活解锁物业价值',
    'marquee.slide3': '快人一步完成审批',
    'marquee.slide4': '把握资金黄金时间',
    'marquee.slide5': '把压力整合成清晰方案',
    'marquee.slide6': '用低息方案重整卡数',
    'marquee.slide7': '让还款节奏重新可控',
    'marquee.slide8': '重整资金，重新出发',
    'marquee.slide9': '让计划准时起飞',
    'marquee.slide10': '抓住稍纵即逝的机会',
    'marquee.slide11': '用专业建立可靠合作',
    'marquee.slide12': '让资金安排稳步向上',
    'marquee.slide13': '以速度回应每个关键时刻',
    'marquee.slide14': '安全核验，审批更安心',
    'marquee.slide15': '智能风控守住每一步',
    'marquee.slide16': '在关键时刻给您支援',
    'marquee.slide17': '为更大的目标补足力量',
    'process.title': '申请流程',
    'process.subtitle': '简单四步，极速获取资金',
    'process.step1': '网上申请',
    'process.step1_desc': '1分钟填写基本资料',
    'process.step2': '提交文件',
    'process.step2_desc': '上传所需资料',
    'process.step3': '快速审批',
    'process.step3_desc': '15分钟初步审核',
    'process.step4': '极速放款',
    'process.step4_desc': '最快3小时过数',
    'products.title': '贷款产品',
    'products.subtitle': '多元化信贷方案，满足不同资金需求',
    'product.learn_more': '了解更多',
    'pain.title': '资金困难？我们帮到你！',
    'pain.item1': '卡债缠身，利息越滚越大？',
    'pain.item2': '生意周转急需资金？',
    'pain.item3': '银行审批太慢，等不及？',
    'pain.item4': '物业有价，但现金不足？',
    'pain.cta': '免费咨询',
    'stats.clients': '服务客户',
    'stats.amount': '累计放款',
    'stats.rate': '批核率',
    'stats.speed': '平均放款',
    'footer.products': '贷款产品',
    'footer.tools': '贷款工具',
    'footer.about': '关于我们',
    'footer.about_us': '公司介绍',
    'footer.contact': '关于我们',
    'footer.terms': '条款及隐私',
    'footer.disclaimer': '投诉热线: 6106 9997　忠告: 借钱梗要还，咪俾钱中介',
    'footer.copyright': '© 2026 AGI Credit 智通金融科技。版权所有。',
    'faq.title': '常见问题',
    'faq.subtitle': '解答您的疑问',
    'faq.hero_badge': '财务伞护 · 疑难解答',
    'contact.title': '关于我们',
    'contact.subtitle': '我们的专业顾问随时为您服务',
    'contact.phone': '客服热线',
    'contact.whatsapp': 'WhatsApp',
    'contact.email': '电邮地址',
    'contact.address': '办公地址',
    'contact.hours': '营业时间',
    'contact.form_title': '在线留言',
    'contact.name': '您的姓名',
    'contact.message': '留言内容',
    'contact.send': '发送留言',
    'contact.hero_badge': '专业顾问 · 随时待命',
    'about.title': '关于我们',
    'about.p1': '我们专注于财务信贷业务，致力以全端全人工智能 Full Stack AI 金融科技颠覆传统信贷流程。',
    'about.p2': '承袭集团扎根香港50年的深厚物业市场人脉与数据积淀，我们将数十年的物业估值经验完美融合于自研的 AI 系统中。透过全自动化数据分析，我们不仅精准掌握香港物业市场的实时脉搏，更能实现秒速精确估值。',
    'about.p3': '正因为我们全面推行AI 驱动的数智化营运体系，成功大幅降低营运成本，并将这些科技红利直接回馈客户，为您提供更低息、更高效、更具竞争力的贷款方案。',
    'contact.info_title': '联络信息',
    'contact.address_val': '香港中环德辅道中 19 号环球大厦 28 楼 2801 室',
    'contact.hours_val': '星期一至五: 09:00 - 18:00 (公众假期除外)',
    'contact.family_title': '为了家人的幸福，为您解决财务难题',
    'contact.family_desc': '我们知道每一次贷款申请的背后，都是对家庭的一份责任。不论是装修新居、生意运作，还是帮助子女升学，我们都将以最合理、最温暖的方式为您提供支持，让您的家始终充满温馨与欢笑。',
    'terms.title': '条款及隐私政策',
    'terms.hero_badge': '合规经营 · 诚信至上',
    'modal.success_title': '申请已提交！',
    'modal.success_text': '我们的客户经理将在15分钟内通过电话或WhatsApp与您联系。',
    'modal.ok': '确认',
    'calc.title': '贷款计算器',
    'calc.amount': '贷款金额',
    'calc.rate': '年利率',
    'calc.term': '还款期（月）',
    'calc.type': '还款方式',
    'calc.type_pi': '本息偿还',
    'calc.type_io': '先息后本',
    'calc.monthly': '每月还款额',
    'calc.total_interest': '利息总支出',
    'calc.total_repay': '还款总额',
    'calc.apply_now': '以此方案申请',
    'calc.hero_badge': '科学规划 · 运筹帷幄',
    'calc.hero_desc': '我们为您提供两种主流还款模式的在线测算工具。不论是“本金与利息一同偿还”，还是“先供息、最后归还本金”，只需输入金额、年利率及期限，AI 即可为您精确展示财务明细。',
    'calc.start_btn': '开始计算',
    'calc.exp_title': '了解两种还款方式的区别',
    'calc.exp_pi_desc': '1. 本息偿还法 (Principal & Interest - P&I)：这是最普遍的还款方式。每月供款额固定，包含部分本金和当期利息。初期还利息比例较高，后期本金比例逐渐上升，利息总支出较少。',
    'calc.exp_io_desc': '2. 先息后本法 (Interest-Only - IO)：在还款期内，每月只支付利息，不偿还本金。直到最后一期才一次过归还全部贷款本金。适合短期灵活周转，能大幅降低前期的供款压力，但利息总支出会更高。',
    'months': '个月',
    'max_amount': '最高贷款额',
    'max_ltv': '最高成数',
    'min_rate': '最低利率',
    'max_term': '最长期限',
    // Compare table
    'compare.title': '本公司与传统银行比较',
    'compare.subtitle': '智能化审批，助您免去繁琐程序，资金极速到手',
    'compare.metric': '比较项目',
    'compare.bank': '传统银行',
    'compare.agi': 'AGI Credit 智通金融科技',
    'compare.amount': '最高贷款额',
    'compare.amount_bank': '受限于月薪，通常最高十多倍，或严格看成数限制',
    'compare.amount_agi': '最高3000万港元，主要评估物业估值',
    'compare.speed': '审批时间',
    'compare.speed_bank': '通常需时 2 至 4 星期',
    'compare.speed_agi': '最快3分钟批核，3小时放款过数',
    'compare.docs': '所需文件',
    'compare.docs_bank': '极为繁复，需要税单、强积金、入息证明等材料',
    'compare.docs_agi': '简单便捷，无须繁琐入息证明，免压力测试',
    'compare.property': '物业限制',
    'compare.property_bank': '不接受唐楼、村屋、商铺、车位或老旧物业',
    'compare.property_agi': '接受唐楼、村屋、商铺、车位、旧楼等多类型',
    'faq.q1': '申请物业按揭贷款需要收费吗？',
    'faq.a1': '我们所有的咨询、物业估价及申请评估服务都是完全免费的。如果您的贷款没有获批或最终没有签署合同，我们不会收取任何费用。在合同签署前，我们也会向您明示所有利息及相关手续费用，保证透明。',
    'faq.q2': '信贷评级 (TU) 较差是否会影响申请？',
    'faq.a2': '与传统银行不同，我们作为持牌非银行金融机构，拥有灵活的 AI 审批机制。我们不单看您的 TU 信贷评级，更关注您目前的物业剩余价值以及实际还款能力。因此，即使 TU 评级不佳，您依然有极大机会获得批核。',
    'faq.q3': '最快可以多久拿到贷款现金？',
    'faq.a3': '在您提交齐全的申请文件（身份证、楼契/按揭供款记录、流水账单等）后，我们的 AI 评估系统最快能在 15 分钟之内给出初步批核额度及利率。在双方签署法律文件并完成必要手续后，贷款最快可于 24 小时内过数至您的账户。',
    'faq.q4': '我可以随时提前还款吗？有罚息期吗？',
    'faq.a4': '可以。我们提供高度弹性的还款计划。在合约规定的框架内，您可随时申请提前部分或全部还款。我们不设苛刻的罚息条款，详细的提前还款细则会在签署合约前向您逐一解释清楚。',
    'faq.q5': '如果我的物业是与家人联名持有，我能单独借贷吗？',
    'faq.a5': '如果您申请的是“公司业主 LTV 95%”这类私人贷款，只要您能证明物业所有权，即可由您个人单独申请，无须联名持有人签署。但如果您申请的是大额“物业一按或二按”抵押贷款，由于需要办理合规的物业权益登记，通常需要所有联名持有人共同出席并签署相关文件。',
    'terms.subtitle': '我们严格遵守香港特别行政区相关法律法规，采取高标准的数据加密与隐私保护措施，保障您在申请贷款过程中的个人信息安全。',
    'terms.section1_title': '1. 隐私政策与个人资料收集声明',
    'terms.section1_p1': 'AGI Credit 智通金融科技（下称“本公司”或“我们”）致力于保障及维护客户的个人资料隐私。我们将确保在收集、使用、保留、披露、转移、保安及查阅个人资料时，严格遵守香港法例第 486 章《个人资料（隐私）条例》的规定。',
    'terms.section1_p2': '当您使用本网站的快速贷款申请表或留言咨询时，我们可能会收集您的个人资料，包括但不限于您的姓名、电话号码、期望贷款金额及类别。该等资料将仅用于：',
    'terms.section1_li1': '评估及处理您的贷款申请，进行初步资信核验；',
    'terms.section1_li2': '回应您的查询，联络您并提供相关财务顾问服务；',
    'terms.section1_li3': '在获得您明确同意的情况下，向您发送本公司的最新推广活动及直销信息；',
    'terms.section1_li4': '履行任何适用法律及持牌财务公司守则下的合规审计及申报义务。',
    'terms.section2_title': '2. 贷款申请服务条款及细则',
    'terms.section2_p1': '在使用本网站提交贷款申请意向时，您必须声明并保证：',
    'terms.section2_li1': '您所提供的所有个人资料、联系方式以及期望贷款额度均是真实、准确且无误的；',
    'terms.section2_li2': '您提交此申请代表您正式授权本公司的客户服务代表或信贷经理，在收到资料后通过您所填写的手工号码（包括拨打电话、发送短信及通过 WhatsApp）与您取得联系并跟进后续批核事宜；',
    'terms.section2_li3': '本网站提供的初步测算结果（如计算器得出的月供等）仅供参考，不构成任何正式的贷款承诺。最终批核额度、利率及条款将以您最终签署的法律合约为准。',
    'terms.section3_title': '3. 直销推广及市场调查同意声明',
    'terms.section3_p1': '本公司希望在获得您的同意后，使用您的个人联络资料进行直销。我们可能会向您发送关于物业按揭、二按、私人信贷、结余转户及税务贷款等产品的优惠推广信息。如果您不希望接收此类直销信息，您可以在填写表单时不勾选“同意接收推广信息”，或在日后随时致电我们的客服热线取消订阅。',
    'terms.section4_title': '4. 放债人条例警示声明',
    'calc.subtitle': '拖动滑块即可实时测算您的每月还款金额及利息开支',
    'equity_cashout.val_1': '释放物业升值额',
    'equity_cashout.lbl_1': '主要功能',
    'equity_cashout.target_title': '适合对象',
    'equity_cashout.target_1': '持有的物业在近几年大幅升值，希望提取溢价资金的业主',
    'equity_cashout.target_2': '希望获取低成本（年息5.8%起）资金进行生意投资、再买房或理财的业主',
    'equity_cashout.target_3': '有装修、子女升学、婚礼等大额现金消费需求的家庭',
    'equity_cashout.docs_title': '所需文件',
    'equity_cashout.docs_1': '香港身份证 / 护照',
    'equity_cashout.docs_2': '最近三个月的住址证明',
    'equity_cashout.docs_3': '原物业按揭贷款供款表及近三个月供款单',
    'equity_cashout.docs_4': '最近三个月的银行流水及资产证明（如适用）',
    'equity_cashout.faq_q1': '什么是“物业加按”？',
    'equity_cashout.faq_a1': '加按（Top-up）是指在不改变原本按揭机构（如银行）的情况下，向原机构申请增加按揭金额；或者通过转按至新机构，提取已升值部分的差额。套现资金完全由您自由支配。',
    'equity_cashout.faq_q2': '物业估值如何影响套现额度？',
    'equity_cashout.faq_a2': '物业最新市值越高，可套取的资金就越多。例如，物业原价 600 万，现升值至 1000 万，按 8 成成数计算，可贷额度增至 800 万。扣除一按余额后，剩余的数百万差额即可套取出现金。',
    'first_mortgage.val_1': 'HK$ 3000万',
    'first_mortgage.val_2': '高达 9 成',
    'first_mortgage.val_3': '低至 5.8%',
    'first_mortgage.val_4': '长达 120期',
    'first_mortgage.target_title': '适合对象',
    'first_mortgage.target_1': '名下持有未抵押物业，急需大额周转资金的业主',
    'first_mortgage.target_2': '需要灵活营运资金进行扩张或进货的中小企业主',
    'first_mortgage.target_3': '无法提供常规收入证明，或受限于银行信贷评级的借款人',
    'first_mortgage.target_4': '物业类型特殊（如村屋、商铺、旧楼等）被银行拒收者',
    'first_mortgage.docs_title': '所需文件',
    'first_mortgage.docs_1': '香港身份证 / 护照',
    'first_mortgage.docs_2': '最近三个月的住址证明（如水电费单或银行账单）',
    'first_mortgage.docs_3': '物业楼契或最新估价资料',
    'first_mortgage.docs_4': '最近三个月的银行流水账单（如适用）',
    'first_mortgage.faq_q1': '什么是“一按”？它与二按有什么区别？',
    'first_mortgage.faq_a1': '“一按”是指借款人将未抵押的物业作为第一顺位抵押物向我们申请贷款；“二按”是在该物业已有第一抵押（通常是银行按揭）的情况下，将剩余价值再次抵押给我们。一按的贷款额度更大、利率更低。',
    'first_mortgage.faq_q2': '哪些类型的物业可以申请一按？旧唐楼、村屋可以吗？',
    'first_mortgage.faq_a2': '可以。相对于传统银行，我们的审批标准更为宽松。不论是普通住宅、豪宅、唐楼、村屋、写字楼、商铺、车位，甚至是不完整产权的物业，我们均可接受申请并予以快速估价。',
    'first_mortgage.faq_q3': '没有常规入息证明，可以申请一按吗？',
    'first_mortgage.faq_a3': '可以。我们更注重物业本身的市场估值及借款人的实际财务需求。即使您是自雇人士、自由职业者、无固定收入者或信贷评级不理想，我们的专业团队也会为您度身定制合适的信贷方案。',
    'first_mortgage.faq_q4': '一按贷款的最快放款时间是多少？',
    'first_mortgage.faq_a4': '在您提交齐全的文件资料后，我们最快可在 15 分钟之内完成初步评估，并在签署合约后的 24 小时之内将贷款发放至您的指定账户。',
    'owner_loan.val_1': 'HK$ 150万',
    'owner_loan.val_2': '免收楼契/免抵押',
    'owner_loan.lbl_2': '质押条件',
    'owner_loan.val_3': '低至 8%',
    'owner_loan.val_4': '长达 60期',
    'owner_loan.target_title': '适合对象',
    'owner_loan.target_1': '手头持有物业（如居屋、私楼、村屋等），但不想将物业进行正式抵押登记的业主',
    'owner_loan.target_2': '楼契不在手头（如仍在银行办理按揭中）的业主',
    'owner_loan.target_3': '急需小额至中额现金，且希望审批手续比物业按揭更为快速简单的客户',
    'owner_loan.docs_title': '所需文件',
    'owner_loan.docs_1': '香港身份证',
    'owner_loan.docs_2': '物业持有权证明（如差饷单、水电费单或供楼记录）',
    'owner_loan.docs_3': '最近三个月的个人银行账户流水（如适用）',
    'owner_loan.faq_q1': '为什么叫“免楼契”业主贷？不需要交楼契吗？',
    'owner_loan.faq_a1': '是的。传统物业按揭贷款需要将“楼契”质押给贷款机构并办理田土厅抵押登记（俗称钉契）。而本计划纯粹是专门针对业主设计的特快私人信贷，我们不押契、不钉契，借款手续极为简化。',
    'owner_loan.faq_q2': '联名持有物业，可以单独申请公司业主 LTV 95%吗？',
    'owner_loan.faq_a2': '可以。如果您名下的物业是联名持有的（例如夫妻双方联名或家人共持），只要您个人有实际财务周转需求，您就可以业主之一的身份单独向我们提出申请，无须其他联名人签字或同意。',
    'refinance.val_1': '减息高达 50%',
    'refinance.lbl_1': '利息节省空间',
    'refinance.val_2': '高达 8 成',
    'refinance.debt_title': '多笔债务压身？卡数利息滚雪球？',
    'refinance.debt_desc': '信用卡最低还款额（Min Pay）实际年利率（APR）往往高达 30% 以上。若只还 Min Pay，债务可能滚几十年也无法清还！透过我们的“物业转按/结余转户”计划，把所有散乱的高息债务整合为单一低息物业贷款，利息大幅降至6%起，让您轻松告别滚雪球式债务。',
    'refinance.pain_1': '整合散乱信用卡债、私人贷款为单一月供',
    'refinance.pain_2': '利息支出大幅减少，拒绝高达30%的卡债年息',
    'refinance.pain_3': '还款期重新拉长，显著改善每月家庭现金流',
    'refinance.target_title': '适合对象',
    'refinance.target_1': '信用卡长期拖欠、卡数高企，饱受高息折磨的业主',
    'refinance.target_2': '在多间财务公司持有高息私人贷款或高息二按的客户',
    'refinance.target_3': '现有按揭利息偏高，希望转到更优惠低息平台的业主',
    'refinance.docs_title': '所需文件',
    'refinance.docs_1': '香港身份证',
    'refinance.docs_2': '最近三个月的所有信用卡及私人贷款月结单',
    'refinance.docs_3': '原按揭银行或财务公司的供款记录/合约',
    'refinance.docs_4': '最近三个月的住址证明及银行流水账单',
    'refinance.faq_q1': '什么是“结余转户 / 转按清数”？',
    'refinance.faq_a1': '这是指利用物业剩余的按揭空间，向我们申请一笔低息按揭，直接清还您名下所有的信用卡欠款（卡数）、高息私人贷款等。整合后，多笔债务变为单一供款，利息支出大幅降低，月供更为轻松。',
    'refinance.faq_q2': '转按是否可以套取额外现金？',
    'refinance.faq_a2': '可以。在转按过程中，如果您的物业在近几年已经升值，除清还原按揭和债务外，剩余的溢价部分亦可一并申请套取额外的现金，作灵活周转或个人投资用途。',
    'refinance.faq_q3': '转按需要支付高额手续费或律师费吗？',
    'refinance.faq_a3': '我们所有的费用均透明合理。在初步咨询与估价阶段是完全免费的。若成功批核，相关费用与律师登记费会事先在合同中列明，通常可以直接从贷款额中扣除，您无须提前支付额外开支。',
    'second_mortgage.val_1': 'HK$ 1,000万',
    'second_mortgage.val_2': '免经一按银行',
    'second_mortgage.lbl_2': '办理条件',
    'second_mortgage.val_3': '低至 12%',
    'second_mortgage.val_4': '长达 120期',
    'second_mortgage.target_title': '适合对象',
    'second_mortgage.target_1': '物业已有一按（如银行按揭），急需额外周转金且不愿意动用一按的业主',
    'second_mortgage.target_2': '希望免去一按银行同意手续，简化审批程序的借款人',
    'second_mortgage.target_3': '急需在极短时间（如3小时内）获取资金进行短期周转的客户',
    'second_mortgage.docs_title': '所需文件',
    'second_mortgage.docs_1': '香港身份证 / 护照',
    'second_mortgage.docs_2': '一按银行的供款表及最新供楼记录',
    'second_mortgage.docs_3': '最近三个月的住址证明（如水电费单）',
    'second_mortgage.docs_4': '最近三个月的银行账户流水账单',
    'second_mortgage.faq_q1': '物业二按是否真的不需要通知一按银行同意？',
    'second_mortgage.faq_a1': '是的。我们的二按核心卖点之一就是“免经银行同意”。我们有一套独立的评估与登记程序，因此不需要耗费漫长时间去向您的一按银行申请同意书，从而极大地加快了贷款办理速度。',
    'second_mortgage.faq_q2': '二按的最高成数如何计算？',
    'second_mortgage.faq_a2': '二按成数取决于物业目前的最新市场估值与您一按按揭的尚欠余额。一般而言，物业一按加上二按的总贷款成数最高可达物业估值的 8.5 成。',
    'second_mortgage.faq_q3': '如果我的一按正在断供或有不良记录，可以申请二按吗？',
    'second_mortgage.faq_a3': '我们需要评估您的一按欠款及物业权益。即使有短期逾期或信贷记录瑕疵，我们专业的财务顾问也会尽力协助您进行重组或加按清还，具体情况请直接联系我们进行免费个案评估。',
    'sme_loan.val_1': 'HK$ 1,000万',
    'sme_loan.val_2': '最快 24 小时',
    'sme_loan.val_4': '长达 84期',
    'sme_loan.partner_title': '急您所急，做您最可靠的商业伙伴',
    'sme_loan.partner_desc': '商业经营千变万化，资金需求往往突如其来。银行的商业贷款申请手续冗长、要求抵押物繁多，且审批耗时数周甚至数月。我们深明中小企的痛点，以最快的速度、灵活的还款期限和合理的利息，提供全方位支持，助您的企业大展宏图。',
    'sme_loan.benefit_1': '无需繁冗的公司财务审计报告，免除繁杂文书手续',
    'sme_loan.benefit_2': '利息合理透明，可配合公司现金流进行“先息后本”灵活供款',
    'sme_loan.benefit_3': '支持以公司名义或个人股东名下物业（私楼/商铺/工厦）作抵押申请',
    'sme_loan.target_title': '适合对象',
    'sme_loan.target_1': '急需大额流动性资金支付货款、员工薪资、公司交税的本港中小企业主',
    'sme_loan.target_2': '因业务扩张、装修或拓展新项目而急需短期资金支持的企业',
    'sme_loan.target_3': '在银行信贷评级不足或无法取得传统银行商业按揭额度的公司',
    'sme_loan.docs_title': '所需文件',
    'sme_loan.docs_1': '公司商业登记证 (BR) 及周年申报表 (NAR1)',
    'sme_loan.docs_2': '董事及大股东的身份证明文件',
    'sme_loan.docs_3': '最近六个月的公司银行流水账单',
    'sme_loan.docs_4': '相关物业资料证明（如用作物业抵押登记）',
    'sme_loan.faq_q1': '中小企贷款是否必须提供房屋抵押？',
    'sme_loan.faq_a1': '不一定。虽然提供物业（如办公室、铺位或股东私人房产）作为抵押可以获得更低的利率和更高的信贷额度，但如果您的企业经营流水表现优异，您亦可申请我们专门设计的无抵押中小企业信用贷。',
    'sme_loan.faq_q2': '我的公司刚成立不久，可以申请商业贷款吗？',
    'sme_loan.faq_a2': '可以。相对于传统银行严格要求公司需有 2 至 3 年审计报告和稳定营收，我们的审批更为灵活。只要您的公司在香港合法注册，且大股东名下持有本港物业，我们均可接受个案申请。',
    'tax_loan.val_1': 'HK$ 200万',
    'tax_loan.val_3': '低至 4.5%',
    'tax_loan.val_4': '长达 24期',
    'tax_loan.target_title': '适合对象',
    'tax_loan.target_1': '面临大额薪俸税交税压力的本港居民',
    'tax_loan.target_2': '需要交纳公司利得税、希望保留充足现金流的中小企业主',
    'tax_loan.target_3': '希望享受极低利息（年息4.5%起）的特快贷款客户',
    'tax_loan.docs_title': '所需文件',
    'tax_loan.docs_1': '香港身份证',
    'tax_loan.docs_2': '税务局发出的最新税单 (Tax Demand Note)',
    'tax_loan.docs_3': '最近三个月的住址证明及入息证明',
    'tax_loan.faq_q1': '税季贷款的还款期最长多久？',
    'tax_loan.faq_a1': '税季贷款主要是为了解决年度税款的开支压力。为了让您能在下一个税季到来前清还贷款，我们提供的还款期最长为 24 个月。',
    'tax_loan.faq_q2': '我可以借多于税单上的应缴税额吗？',
    'tax_loan.faq_a2': '可以。只要您的财务状况及还款能力良好，我们批出的最高税贷额度可高达您应缴税款的 2 倍，或者最高 200 万港元（以较低者为准），让您有额外现金作灵活支配。',
  },
  'en': {
    'nav.products': 'Loan Products',
    'nav.tools': 'Tools',
    'nav.faq': 'FAQ',
    'nav.contact': 'About Us',
    'nav.news': 'Finance News',
    'nav.apply': 'Apply Now',
    // Products
    'product.first_mortgage': 'First Mortgage',
    'product.second_mortgage': 'Second Mortgage',
    'product.refinance': '70% Refinance',
    'product.equity_cashout': 'Top-up Cashout',
    'product.owner_loan': 'Owner LTV 95%',
    'product.sme_loan': 'SME Business Loan',
    'product.tax_loan': 'Single-deed 3-day Draw',
    'product.owner_p_loan': 'Owner P Loan',
    'product.clear_card': 'Card Debt Consolidation',
    'product.backup_credit': 'Standby Credit @ No Use No Interest',
    // Product details specific
    'product.first_mortgage_badge': 'First Choice for Large Turnovers · Unlimited Property Types',
    'product.first_mortgage_subtitle': 'Use your unmortgaged property as the primary collateral to obtain high-limit liquidity. We offer flexible repayment plans, no restrictions on property age or type, to help you release capital from assets.',
    'product.second_mortgage_badge': 'No Bank Consent Required · Flexible Withdrawal',
    'product.second_mortgage_subtitle': 'Second mortgage on the remaining equity of the property. No first mortgage bank consent required, ultra-fast registration and fund allocation for your immediate investment needs.',
    'product.refinance_badge': 'Consolidate High-Interest Debts · Reset Financial Life',
    'product.refinance_subtitle': 'Consolidate credit cards, high-interest personal loans and second mortgages into a single low-interest first mortgage. Extend repayment terms and reduce monthly payments by up to 60%!',
    'product.equity_cashout_badge': 'Asset Appreciation · Cashout',
    'product.equity_cashout_subtitle': 'Top-up mortgage on your property to extract equity from appreciation at low cost. Convert fixed assets into liquid capital to expand businesses, reinvest or cover large family expenses.',
    'product.owner_loan_badge': 'No Mortgage Registration · High Limit for Owners',
    'product.owner_loan_subtitle': 'Unsecured personal loan designed specifically for property owners. No deeds required, no registration at Land Registry. Borrow up to HK$1.5M with owner identity instantly.',
    'product.sme_loan_badge': 'Fast Approval · Energize Businesses',
    'product.sme_loan_subtitle': 'Agile liquidity support for HK SMEs. Perfect for inventory procurement, taxes, rent, payroll, or business expansion. Get up to HK$10M in 24 hours via efficient AI evaluation.',
    'product.tax_loan_badge': 'Tax Season Dedicated · Low Interest',
    'product.tax_loan_subtitle': 'Handle your personal salaries tax or corporate profits tax easily. Interest rates from 4.5% p.a., loan amounts up to HK$2M, flexible terms up to 24 months to secure your cash flow.',
    'product.first_mortgage_desc': 'Max loan amount HK$30M, LTV up to 90%, interest rate from 5.8%, term up to 120 months.',
    'product.second_mortgage_desc': 'No first mortgage bank consent required, loan amount up to HK$10M, express approval.',
    'product.refinance_desc': 'Consolidate card debts and refinance to lower interest rate mortgage loans.',
    'product.equity_cashout_desc': 'Top-up mortgage to extract equity from property appreciation for liquid funds.',
    'product.owner_loan_desc': 'No deeds registration required, obtain a standby credit line with owner identity.',
    'product.sme_loan_desc': 'Low interest, quick approval, and flexible repayment terms for SME cash flow needs.',
    'product.tax_loan_desc': 'Fast single-deed drawdown, arrange funds within 3 days for urgent cash flow.',
    'product.owner_p_loan_desc': 'Owner-only personal loan with a simpler process for household or business cash flow.',
    'product.clear_card_desc': 'Consolidate credit card and high-interest debt to reduce monthly repayment pressure.',
    'product.backup_credit_desc': 'Pre-approved standby limit for use when needed; unused credit does not incur interest.',
    'tool.calculator': 'Mortgage Calculator',
    'tool.affordability': 'Affordability Check',
    'tool.valuation': 'Property Valuation',
    'form.title': '⚡ Quick Apply',
    'form.loan_amount': 'Loan Amount (HK$)',
    'form.loan_category': 'Loan Type',
    'form.loan_term': 'Loan Term',
    'form.phone': 'Phone Number',
    'form.terms': 'I agree to the',
    'form.terms_link': 'Terms & Conditions',
    'form.privacy': 'and',
    'form.privacy_link': 'Privacy Policy',
    'form.marketing': 'Agree to receive promotional information',
    'form.submit': 'Apply Now',
    'form.select_category': 'Loan type',
    'form.select_term': 'Term',
    'term.1': '1 Month',
    'term.3': '3 Months',
    'term.6': '6 Months',
    'term.12': '12 Months',
    'term.24': '24 Months',
    'term.36': '36 Months',
    'term.60': '60 Months',
    'term.120': '120 Months',
    'hero.badge': 'Licensed Financial Institution · AI-Powered',
    'hero.title_1': 'Big First Mortgage, ',
    'hero.title_2': 'Fast Second Mortgage',
    'hero.subtitle': 'Approval in 3 minutes, cash as fast as 3 hours.',
    'hero.stat_1_value': 'HK$30M',
    'hero.stat_1_label': 'Max Loan Amount',
    'hero.stat_2_value': '90%',
    'hero.stat_2_label': 'Max LTV',
    'hero.stat_3_value': '5.8%',
    'hero.stat_3_label': 'From Rate',
    'hero.stat_4_value': '3 hrs',
    'hero.stat_4_label': 'Fast Disbursement',
    'marquee.slide1': 'Large First Mortgage, Fast Second Mortgage',
    'marquee.slide2': 'Unlock Property Value Flexibly',
    'marquee.slide3': 'Move Faster Through Approval',
    'marquee.slide4': 'Capture the Right Funding Window',
    'marquee.slide5': 'Turn Pressure Into a Clear Plan',
    'marquee.slide6': 'Restructure Card Debt With Lower Rates',
    'marquee.slide7': 'Make Repayment Rhythm Manageable Again',
    'marquee.slide8': 'Rebuild Cash Flow and Move Forward',
    'marquee.slide9': 'Let Your Plan Take Off on Time',
    'marquee.slide10': 'Seize Time-Sensitive Opportunities',
    'marquee.slide11': 'Build Reliable Partnerships With Expertise',
    'marquee.slide12': 'Lift Your Funding Plan Steadily',
    'marquee.slide13': 'Respond Fast at Every Critical Moment',
    'marquee.slide14': 'Secure Checks for Safer Approval',
    'marquee.slide15': 'Smart Risk Control at Every Step',
    'marquee.slide16': 'Support When the Moment Matters',
    'marquee.slide17': 'Add Strength for Bigger Goals',
    'process.title': 'How It Works',
    'process.subtitle': 'Simple 4 steps to get your funds',
    'process.step1': 'Online Apply',
    'process.step1_desc': '1-minute application form',
    'process.step2': 'Submit Docs',
    'process.step2_desc': 'Upload required documents',
    'process.step3': 'Quick Review',
    'process.step3_desc': '15-minute preliminary review',
    'process.step4': 'Fast Disbursement',
    'process.step4_desc': 'Funds as fast as 24 hours',
    'products.title': 'Loan Products',
    'products.subtitle': 'Diversified credit solutions for all your needs',
    'product.learn_more': 'Learn More',
    'pain.title': 'Financial difficulties? We can help!',
    'pain.item1': 'Credit card debt piling up with high interest?',
    'pain.item2': 'Urgent business cash flow needs?',
    'pain.item3': 'Bank approval too slow?',
    'pain.item4': 'Property valuable but cash-tight?',
    'pain.cta': 'Free Consultation',
    'stats.clients': 'Clients Served',
    'stats.amount': 'Total Disbursed',
    'stats.rate': 'Approval Rate',
    'stats.speed': 'Avg. Disbursement',
    'footer.products': 'Loan Products',
    'footer.tools': 'Tools',
    'footer.about': 'About Us',
    'footer.about_us': 'About Us',
    'footer.contact': 'About Us',
    'footer.terms': 'Terms & Privacy',
    'footer.disclaimer': 'Complaint hotline: 6106 9997. Warning: Think before you borrow. Repay responsibly.',
    'footer.copyright': '© 2026 AGI Credit. All rights reserved.',
    'faq.title': 'FAQ',
    'faq.subtitle': 'Answers to common questions',
    'faq.hero_badge': 'Financial Umbrella · Quick Answers',
    'contact.title': 'About Us',
    'contact.subtitle': 'Our professional consultants are here to help',
    'contact.phone': 'Hotline',
    'contact.whatsapp': 'WhatsApp',
    'contact.email': 'Email',
    'contact.address': 'Office Address',
    'contact.hours': 'Business Hours',
    'contact.form_title': 'Leave a Message',
    'contact.name': 'Your Name',
    'contact.message': 'Message',
    'contact.send': 'Send Message',
    'contact.hero_badge': 'Professional Consultants · On Standby',
    'about.title': 'About Us',
    'about.p1': 'We specialize in consumer and property credit business, dedicated to transforming the traditional lending process with Full Stack AI financial technology.',
    'about.p2': 'Inheriting the group\'s deep roots in the Hong Kong property market for 50 years, with vast networks and data accumulation, we seamlessly integrate decades of property valuation expertise into our proprietary AI system. Through automated data analysis, we not only capture the real-time pulse of the Hong Kong property market but also achieve instant and precise valuations.',
    'about.p3': 'Because we fully implement an AI-driven digital intelligence operations system, we have successfully reduced operating costs and pass these technological benefits directly back to our customers, providing you with lower interest rates, higher efficiency, and more competitive loan solutions.',
    'contact.info_title': 'Contact Info',
    'contact.address_val': 'Unit 2801, 28/F, Worldwide House, 19 Des Voeux Road Central, Central, Hong Kong',
    'contact.hours_val': 'Mon - Fri: 09:00 - 18:00 (Except Public Holidays)',
    'contact.family_title': 'For Your Family\'s Happiness, We Resolve Financial Difficulties',
    'contact.family_desc': 'We know behind every loan is a responsibility to your family. Whether it is home renovation, business operations, or children\'s education, we support you in the most reasonable and warm way.',
    'terms.title': 'Terms & Privacy Policy',
    'terms.hero_badge': 'Compliance · Integrity First',
    'modal.success_title': 'Application Submitted!',
    'modal.success_text': 'Our account manager will contact you via phone or WhatsApp within 15 minutes.',
    'modal.ok': 'OK',
    'calc.title': 'Mortgage Calculator',
    'calc.amount': 'Loan Amount',
    'calc.rate': 'Annual Rate',
    'calc.term': 'Term (Months)',
    'calc.type': 'Repayment Method',
    'calc.type_pi': 'Principal & Interest',
    'calc.type_io': 'Interest Only',
    'calc.monthly': 'Monthly Payment',
    'calc.total_interest': 'Total Interest',
    'calc.total_repay': 'Total Repayment',
    'calc.apply_now': 'Apply with this plan',
    'calc.hero_badge': 'Strategic Planning · Financial Foresight',
    'calc.hero_desc': 'We offer two mainstream repayment calculation tools. Whether it is "Principal & Interest" or "Interest Only", input your figures to instantly display financial details powered by AI.',
    'calc.start_btn': 'Start Calculation',
    'calc.exp_title': 'Understanding the Difference Between Two Repayment Methods',
    'calc.exp_pi_desc': '1. Principal & Interest (P&I): The most common repayment method. Fixed monthly payments consisting of both principal and interest. Higher interest portion in the beginning, with more principal paid off later, resulting in lower total interest.',
    'calc.exp_io_desc': '2. Interest Only (IO): Pay only interest each month during the term, and pay back the entire principal in the final month. Ideal for short-term flexibility, reducing initial cash flow pressure, though total interest is higher.',
    'months': 'months',
    'max_amount': 'Max Amount',
    'max_ltv': 'Max LTV',
    'min_rate': 'Min Rate',
    'max_term': 'Max Term',
    // Compare table
    'compare.title': 'Comparison Between Our Company & Traditional Banks',
    'compare.subtitle': 'AI-powered approvals, skip the red tape, access funds fast',
    'compare.metric': 'Metrics',
    'compare.bank': 'Traditional Banks',
    'compare.agi': 'AGI Credit',
    'compare.amount': 'Max Loan Amount',
    'compare.amount_bank': 'Limited by monthly income, typically around 12-18x salary',
    'compare.amount_agi': 'Up to HK$30M, evaluated on property valuation',
    'compare.speed': 'Approval Speed',
    'compare.speed_bank': 'Takes about 2 to 4 weeks',
    'compare.speed_agi': '3-min approval, 3-hour disbursement',
    'compare.docs': 'Required Documents',
    'compare.docs_bank': 'Extremely tedious, requires tax demand notes, MPF statements, income proofs',
    'compare.docs_agi': 'Simple & convenient, no stress test, low credit requirement',
    'compare.property': 'Property Limitations',
    'compare.property_bank': 'Rejects older buildings, village houses, retail shops, parking spaces',
    'compare.property_agi': 'Accepts older buildings, village houses, shops, parking spaces, and more',
    'faq.q1': 'Are there any fees for applying for a property mortgage loan?',
    'faq.a1': 'All our consulting, property valuation, and application assessment services are completely free. If your loan is not approved or you do not sign the contract, we do not charge any fees. Before signing the contract, we will clearly state all interest rates and related fees to ensure transparency.',
    'faq.q2': 'Will a poor credit rating (TU) affect the application?',
    'faq.a2': 'Unlike traditional banks, as a licensed non-bank financial institution, we have a flexible AI approval mechanism. We look beyond just your TU credit rating, focusing more on the remaining value of your property and your actual repayment ability. Therefore, even with a poor TU rating, you still have a very high chance of getting approved.',
    'faq.q3': 'How fast can I get the loan cash?',
    'faq.a3': 'Once you submit a complete set of application documents (ID card, property deeds/mortgage repayment records, bank statements, etc.), our AI evaluation system can provide a preliminary approval amount and interest rate in as fast as 15 minutes. After signing the legal documents and completing the necessary procedures, the funds can be transferred to your account in as fast as 24 hours.',
    'faq.q4': 'Can I repay the loan early at any time? Is there an early repayment penalty period?',
    'faq.a4': 'Yes. We offer highly flexible repayment plans. Within the terms of the contract, you can apply for partial or full early repayment at any time. We do not impose harsh penalty terms. Detailed terms of early repayment will be explained to you before signing the contract.',
    'faq.q5': 'If my property is jointly owned with family members, can I borrow individually?',
    'faq.a5': 'If you are applying for an unsecured personal loan like the \'Owner Private Loan\', as long as you can prove property ownership, you can apply individually without the signature of joint owners. However, if you are applying for a high-limit first or second mortgage, joint owners must attend and sign the documents for compliant registry registration.',
    'terms.subtitle': 'We strictly comply with the relevant laws and regulations of the Hong Kong Special Administrative Region, adopting high standards of data encryption and privacy protection measures to secure your personal information during the loan application process.',
    'terms.section1_title': '1. Privacy Policy and Personal Data Collection Statement',
    'terms.section1_p1': 'AGI Credit (\'the Company\' or \'we\') is committed to protecting and maintaining the privacy of our customers\' personal data. We ensure strict compliance with the Personal Data (Privacy) Ordinance, Chapter 486 of the Laws of Hong Kong, in collecting, using, retaining, disclosing, transferring, securing, and accessing personal data.',
    'terms.section1_p2': 'When you use the quick loan application form or send an online inquiry on this website, we may collect your personal data, including but not limited to your name, phone number, expected loan amount, and loan type. This data will only be used for:',
    'terms.section1_li1': 'Assessing and processing your loan application and conducting preliminary credit checks;',
    'terms.section1_li2': 'Responding to your inquiries, contacting you, and providing related financial consulting services;',
    'terms.section1_li3': 'Sending you our latest promotional activities and direct marketing information with your explicit consent;',
    'terms.section1_li4': 'Fulfilling compliance audit and reporting obligations under any applicable laws and licensed money lenders codes.',
    'terms.section2_title': '2. Loan Application Terms and Conditions',
    'terms.section2_p1': 'By submitting a loan application intent on this website, you represent and warrant that:',
    'terms.section2_li1': 'All personal data, contact information, and desired loan amounts provided by you are true, accurate, and correct;',
    'terms.section2_li2': 'Your submission represents formal authorization for our customer service representatives or loan managers to contact you via the provided phone number (including voice calls, SMS, and WhatsApp) to follow up on approval matters;',
    'terms.section2_li3': 'Preliminary calculations provided on this website (such as monthly payments from the calculator) are for reference only and do not constitute a formal loan commitment. The final loan amount, rate, and terms are subject to the legally binding contract signed by you.',
    'terms.section3_title': '3. Consent Statement for Direct Marketing and Market Surveys',
    'terms.section3_p1': 'The Company intends to use your personal contact details for direct marketing upon obtaining your consent. We may send you promotional offers regarding property mortgages, second mortgages, personal credit, balance transfers, and tax loans. If you do not wish to receive such information, you may uncheck \'Agree to receive promotional information\' when filling out the form, or call our customer service hotline to unsubscribe at any time.',
    'terms.section4_title': '4. Money Lenders Ordinance Warning Statement',
    'calc.subtitle': 'Drag the slider to calculate your monthly payment and interest expense in real time',
    'equity_cashout.val_1': 'Release Equity from Appreciation',
    'equity_cashout.lbl_1': 'Key Feature',
    'equity_cashout.target_title': 'Target Audience',
    'equity_cashout.target_1': 'Property owners whose properties have significantly appreciated, wishing to extract cash from equity',
    'equity_cashout.target_2': 'Owners seeking low-cost (from 5.8% p.a.) capital for business investments, property purchases, or wealth management',
    'equity_cashout.target_3': 'Families with large cash requirements for renovations, education, weddings, etc.',
    'equity_cashout.docs_title': 'Required Documents',
    'equity_cashout.docs_1': 'HKID / Passport',
    'equity_cashout.docs_2': 'Proof of address within the last 3 months',
    'equity_cashout.docs_3': 'Existing mortgage loan repayment schedule and records for the last 3 months',
    'equity_cashout.docs_4': 'Bank statements and asset proof for the last 3 months (if applicable)',
    'equity_cashout.faq_q1': 'What is a \'Top-up Mortgage\'?',
    'equity_cashout.faq_a1': 'A top-up mortgage refers to applying for an additional loan amount from your original mortgage lender without changing it, or refinancing to a new lender to extract cash from the appreciated value. The cashed-out funds are at your free disposal.',
    'equity_cashout.faq_q2': 'How does property valuation affect the cash-out limit?',
    'equity_cashout.faq_a2': 'The higher the current market value of your property, the more capital you can release. For example, if a property originally worth HK$6M has appreciated to HK$10M, at an 80% LTV, the loan limit increases to HK$8M. After deducting the outstanding first mortgage balance, the remaining difference of several millions can be cashed out.',
    'first_mortgage.val_1': 'HK$ 30M',
    'first_mortgage.val_2': 'Up to 90%',
    'first_mortgage.val_3': 'From 5.8%',
    'first_mortgage.val_4': 'Up to 120 months',
    'first_mortgage.target_title': 'Target Audience',
    'first_mortgage.target_1': 'Owners holding unmortgaged property and in urgent need of large funds',
    'first_mortgage.target_2': 'SME owners needing flexible working capital for expansion or stock procurement',
    'first_mortgage.target_3': 'Borrowers who cannot provide regular income proof or are restricted by bank credit ratings',
    'first_mortgage.target_4': 'Borrowers with special property types (village houses, shops, older buildings, etc.) rejected by banks',
    'first_mortgage.docs_title': 'Required Documents',
    'first_mortgage.docs_1': 'HKID / Passport',
    'first_mortgage.docs_2': 'Proof of address within the last 3 months (utility bills or bank statements)',
    'first_mortgage.docs_3': 'Property deeds or latest valuation details',
    'first_mortgage.docs_4': 'Bank statements for the last 3 months (if applicable)',
    'first_mortgage.faq_q1': 'What is a \'First Mortgage\'? How is it different from a second mortgage?',
    'first_mortgage.faq_a1': 'A \'First Mortgage\' means the borrower collateralizes an unmortgaged property as the primary lien to apply for a loan. A \'Second Mortgage\' is when the property already has a first mortgage (usually with a bank) and its remaining equity is collateralized to us. First mortgages offer higher loan limits and lower interest rates.',
    'first_mortgage.faq_q2': 'What types of properties can apply for a first mortgage? Can older buildings and village houses apply?',
    'first_mortgage.faq_a2': 'Yes. Compared to traditional banks, our approval criteria are much more flexible. We accept residential properties, luxury homes, older tenement buildings, village houses, offices, shops, car parks, and even properties with incomplete titles, with fast valuation.',
    'first_mortgage.faq_q3': 'Can I apply for a first mortgage without regular proof of income?',
    'first_mortgage.faq_a3': 'Yes. We focus more on the market valuation of the property and the borrower\'s actual financial needs. Even if you are self-employed, a freelancer, have no fixed income, or have a less-than-ideal credit rating, our professional team can customize a suitable credit solution.',
    'first_mortgage.faq_q4': 'What is the fastest disbursement time for a first mortgage loan?',
    'first_mortgage.faq_a4': 'Upon receiving your complete documents, we can finish the preliminary assessment in as fast as 15 minutes and disburse the loan to your designated account within 24 hours after contract signing.',
    'owner_loan.val_1': 'HK$ 1.5M',
    'owner_loan.val_2': 'No Deeds / No Mortgage Required',
    'owner_loan.lbl_2': 'Collateral Terms',
    'owner_loan.val_3': 'From 8%',
    'owner_loan.val_4': 'Up to 60 months',
    'owner_loan.target_title': 'Target Audience',
    'owner_loan.target_1': 'Property owners (Home Ownership Scheme, private buildings, village houses, etc.) who do not want to register a formal mortgage',
    'owner_loan.target_2': 'Owners whose deeds are not on hand (e.g., currently mortgaged with a bank)',
    'owner_loan.target_3': 'Customers in urgent need of small-to-medium cash and wanting a faster, simpler process than a property mortgage',
    'owner_loan.docs_title': 'Required Documents',
    'owner_loan.docs_1': 'HKID',
    'owner_loan.docs_2': 'Proof of property ownership (rates demand notes, utility bills, or mortgage repayment records)',
    'owner_loan.docs_3': 'Personal bank statements for the last 3 months (if applicable)',
    'owner_loan.faq_q1': 'Why is it called an \'Unsecured\' owner loan? Do I not need to hand over deeds?',
    'owner_loan.faq_a1': 'Yes. Traditional mortgages require pledging the deeds and registering a charge at the Land Registry. This program is a fast personal loan tailored for owners; we do not keep deeds or register a charge, which simplifies the application.',
    'owner_loan.faq_q2': 'Can a joint property owner apply for the unsecured owner loan individually?',
    'owner_loan.faq_a2': 'Yes. If the property is jointly owned (e.g., married couples or family members), as long as you have a personal financial need, you can apply individually as one of the owners without the signatures or consent of the other joint owners.',
    'refinance.val_1': 'Save Up to 50% Interest',
    'refinance.lbl_1': 'Interest Saving Space',
    'refinance.val_2': 'Up to 80%',
    'refinance.debt_title': 'Multiple debts? Snowballing credit card interest?',
    'refinance.debt_desc': 'Credit card Minimum Payment (Min Pay) actual APR is often above 30%. Paying only Min Pay can take decades to clear your debt! Through our \'Property Refinancing / Balance Transfer\' plan, consolidate all scattered high-interest debts into a single low-interest property loan from 5.8% p.a. and escape the snowballing debt cycle.',
    'refinance.pain_1': 'Consolidate credit cards and personal loans into a single monthly payment',
    'refinance.pain_2': 'Drastically reduce interest expenses; reject up to 30% APR card debt',
    'refinance.pain_3': 'Extend repayment periods to significantly improve monthly household cash flow',
    'refinance.target_title': 'Target Audience',
    'refinance.target_1': 'Owners suffering from high-interest rates and persistent credit card debts',
    'refinance.target_2': 'Customers holding multiple high-interest personal loans or second mortgages at other financial companies',
    'refinance.target_3': 'Property owners whose current mortgage rates are too high, wishing to refinance to a more favorable rate',
    'refinance.docs_title': 'Required Documents',
    'refinance.docs_1': 'HKID',
    'refinance.docs_2': 'Statements for all credit cards and personal loans for the last 3 months',
    'refinance.docs_3': 'Repayment schedule/contract with the original bank or finance company',
    'refinance.docs_4': 'Proof of address and bank statements for the last 3 months',
    'refinance.faq_q1': 'What is \'Balance Transfer / Refinance Debt Consolidation\'?',
    'refinance.faq_a1': 'It refers to utilizing the remaining equity of a property to apply for a low-interest mortgage with us, directly paying off all your credit card outstanding and high-interest personal loans. After consolidation, multiple debts are combined into a single payment, interest expenses are reduced, and monthly repayments become much easier.',
    'refinance.faq_q2': 'Can refinancing release extra cash?',
    'refinance.faq_a2': 'Yes. During refinancing, if your property has appreciated in recent years, you can apply to extract extra cash from the appreciation surplus in addition to paying off original mortgages and debts for flexible usage or reinvestment.',
    'refinance.faq_q3': 'Do I need to pay high handling fees or legal fees for refinancing?',
    'refinance.faq_a3': 'All our fees are transparent and reasonable. Initial consulting and valuation are completely free. If approved, related handling and legal registration fees will be listed in the contract, and can typically be deducted directly from the loan amount, so you do not need to pay upfront.',
    'second_mortgage.val_1': 'HK$ 10M',
    'second_mortgage.val_2': 'No Bank Consent Required',
    'second_mortgage.lbl_2': 'Process terms',
    'second_mortgage.val_3': 'From 12%',
    'second_mortgage.val_4': 'Up to 120 months',
    'second_mortgage.target_title': 'Target Audience',
    'second_mortgage.target_1': 'Owners whose property has an existing first mortgage, in need of cash but not wishing to disturb the first mortgage',
    'second_mortgage.target_2': 'Borrowers wishing to bypass the bank\'s consent procedure to simplify approval',
    'second_mortgage.target_3': 'Customers in need of cash within a short time (e.g., 24 hours) for short-term turnover',
    'second_mortgage.docs_title': 'Required Documents',
    'second_mortgage.docs_1': 'HKID / Passport',
    'second_mortgage.docs_2': 'Repayment schedule and recent repayment records of the first mortgage',
    'second_mortgage.docs_3': 'Proof of address within the last 3 months (such as utility bills)',
    'second_mortgage.docs_4': 'Bank statements for the last 3 months',
    'second_mortgage.faq_q1': 'Does a second mortgage really not require notifying the first mortgage bank?',
    'second_mortgage.faq_a1': 'Yes. One of the main selling points of our second mortgage is \'no bank consent required\'. We have an independent evaluation and registry registration process, so there is no need to wait for bank consent, which speeds up processing.',
    'second_mortgage.faq_q2': 'How is the maximum loan-to-value (LTV) of a second mortgage calculated?',
    'second_mortgage.faq_a2': 'The second mortgage limit depends on the latest valuation and the balance of your first mortgage. In general, the combined LTV of the first and second mortgages can be up to 85% of the property value.',
    'second_mortgage.faq_q3': 'Can I apply for a second mortgage if my first mortgage is in default or has negative records?',
    'second_mortgage.faq_a3': 'We need to evaluate the first mortgage outstanding and property equity. Even with short-term delinquency or credit record flaws, our professional advisors will try to assist you with restructuring or cash-out refinancing. Please contact us directly for a free assessment.',
    'sme_loan.val_1': 'HK$ 10M',
    'sme_loan.val_2': 'Fastest 24 Hours',
    'sme_loan.val_4': 'Up to 84 months',
    'sme_loan.partner_title': 'Your Reliable Business Partner in Financial Need',
    'sme_loan.partner_desc': 'Business operations are dynamic, and capital needs often arise suddenly. Bank commercial loan applications are tedious, require extensive collateral, and take weeks or months. We understand the pain points of SMEs and provide comprehensive support with the fastest speed, flexible terms, and reasonable interest to help your business thrive.',
    'sme_loan.benefit_1': 'No complex corporate audit reports required; bypass tedious paperwork',
    'sme_loan.benefit_2': 'Interest is reasonable and transparent; \'Interest Only\' options match cash flow',
    'sme_loan.benefit_3': 'Supports applications using properties (private residential, retail shops, industrial buildings) under the company or individual shareholders',
    'sme_loan.target_title': 'Target Audience',
    'sme_loan.target_1': 'Hong Kong SME owners in urgent need of liquidity to pay for goods, payroll, or corporate taxes',
    'sme_loan.target_2': 'Businesses needing short-term capital for expansion, renovation, or new projects',
    'sme_loan.target_3': 'Companies with insufficient bank credit ratings or unable to secure traditional commercial lines',
    'sme_loan.docs_title': 'Required Documents',
    'sme_loan.docs_1': 'Business Registration Certificate (BR) and Annual Return (NAR1)',
    'sme_loan.docs_2': 'ID documents of directors and major shareholders',
    'sme_loan.docs_3': 'Company bank statements for the last six months',
    'sme_loan.docs_4': 'Property deeds/information (if used for mortgage registration)',
    'sme_loan.faq_q1': 'Must an SME loan be secured by property collateral?',
    'sme_loan.faq_a1': 'Not necessarily. Although providing a property (such as office, shop, or shareholder\'s private estate) as collateral can secure lower interest rates and higher credit lines, you can apply for our unsecured SME credit loan if your company\'s revenue stream is outstanding.',
    'sme_loan.faq_q2': 'My company was recently established. Can I apply for a commercial loan?',
    'sme_loan.faq_a2': 'Yes. Unlike traditional banks which strictly require 2 to 3 years of audited reports and stable revenue, our approvals are more flexible. As long as your company is legally registered in Hong Kong and the major shareholder holds property in Hong Kong, we accept applications.',
    'tax_loan.val_1': 'HK$ 2M',
    'tax_loan.val_3': 'From 4.5%',
    'tax_loan.val_4': 'Up to 24 months',
    'tax_loan.target_title': 'Target Audience',
    'tax_loan.target_1': 'Hong Kong residents facing heavy tax bills',
    'tax_loan.target_2': 'SME owners paying corporate profits tax who want to preserve cash flow',
    'tax_loan.target_3': 'Customers seeking express loans with ultra-low interest (from 4.5% p.a.)',
    'tax_loan.docs_title': 'Required Documents',
    'tax_loan.docs_1': 'HKID',
    'tax_loan.docs_2': 'Latest Tax Demand Note issued by Inland Revenue Department',
    'tax_loan.docs_3': 'Proof of address and proof of income for the last 3 months',
    'tax_loan.faq_q1': 'What is the maximum term for a tax season loan?',
    'tax_loan.faq_a1': 'Tax loans are designed to ease the pressure of annual tax payments. To allow you to clear the debt before the next tax season, we offer a maximum repayment term of 24 months.',
    'tax_loan.faq_q2': 'Can I borrow more than the tax amount on my tax bill?',
    'tax_loan.faq_a2': 'Yes. Subject to satisfactory financial conditions and repayment capability, the maximum tax loan limit can be up to 2 times your tax bill or HK$2M (whichever is lower), giving you extra cash for flexible use.',
  }
};

let currentLang = 'zh-hk';

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('agi-lang', lang);

  // Update lang switch buttons
  document.querySelectorAll('.lang-switch__btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  // Update body class for font
  document.body.classList.remove('lang-zh-cn');
  if (lang === 'zh-cn') document.body.classList.add('lang-zh-cn');

  // Update all translatable elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const text = translations[lang]?.[key];
    if (text) el.textContent = text;
  });

  // Update placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    const text = translations[lang]?.[key];
    if (text) el.placeholder = text;
  });
}

function t(key) {
  return translations[currentLang]?.[key] || translations['zh-hk']?.[key] || key;
}

// Init language
document.addEventListener('DOMContentLoaded', () => {
  const savedLang = localStorage.getItem('agi-lang') || 'zh-hk';
  setLanguage(savedLang);

  // Language switch button events
  document.querySelectorAll('.lang-switch__btn').forEach(btn => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });
});

// ==========================================
// LEAD FORM
// ==========================================
function initLeadForm() {
  const form = document.getElementById('quick-apply-form');
  if (!form) return;

  // Pre-select category based on current page URL
  const categorySelect = document.getElementById('select_loan_category');
  if (categorySelect) {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('first-mortgage')) {
      categorySelect.value = 'first-mortgage';
    } else if (path.includes('second-mortgage')) {
      categorySelect.value = 'second-mortgage';
    } else if (path.includes('refinance')) {
      categorySelect.value = 'refinance';
    } else if (path.includes('equity-cashout')) {
      categorySelect.value = 'equity-cashout';
    } else if (path.includes('owner-loan')) {
      categorySelect.value = 'owner-loan';
    } else if (path.includes('sme-loan')) {
      categorySelect.value = 'sme-loan';
    } else if (path.includes('tax-loan')) {
      categorySelect.value = 'tax-loan';
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm(form)) return;

    const data = {
      phoneNumber: document.getElementById('input_phone_number').value,
      loanAmount: document.getElementById('input_loan_amount').value,
      loanCategory: document.getElementById('select_loan_category').value,
      loanTermMonths: document.getElementById('select_loan_term').value,
      acceptTerms: document.getElementById('chk_accept_terms').checked,
      marketingConsent: document.getElementById('chk_marketing_consent')?.checked || false,
      sourceUrl: window.location.pathname,
    };

    console.log('Lead submitted:', data);

    // Show success modal
    showModal(t('modal.success_title'), t('modal.success_text'));

    // Reset form
    form.reset();
  });
}

function validateForm(form) {
  let valid = true;

  // Phone
  const phone = document.getElementById('input_phone_number');
  const phoneVal = phone.value.trim();
  const phoneRegex = /^[0-9]{8,11}$/;
  if (!phoneRegex.test(phoneVal)) {
    setFieldError(phone, true);
    valid = false;
  } else {
    setFieldError(phone, false);
  }

  // Amount
  const amount = document.getElementById('input_loan_amount');
  const amountVal = parseFloat(amount.value);
  if (!amountVal || amountVal <= 0 || amountVal > 50000000) {
    setFieldError(amount, true);
    valid = false;
  } else {
    setFieldError(amount, false);
  }

  // Category
  const category = document.getElementById('select_loan_category');
  if (!category.value) {
    setFieldError(category, true);
    valid = false;
  } else {
    setFieldError(category, false);
  }

  // Term
  const term = document.getElementById('select_loan_term');
  if (!term.value) {
    setFieldError(term, true);
    valid = false;
  } else {
    setFieldError(term, false);
  }

  // Terms checkbox
  const terms = document.getElementById('chk_accept_terms');
  if (!terms.checked) {
    terms.closest('.form-check')?.classList.add('has-error');
    valid = false;
  } else {
    terms.closest('.form-check')?.classList.remove('has-error');
  }

  return valid;
}

function setFieldError(el, hasError) {
  const group = el.closest('.form-group');
  if (hasError) {
    group?.classList.add('has-error');
    el.classList.add('form-control--error');
  } else {
    group?.classList.remove('has-error');
    el.classList.remove('form-control--error');
  }
}

// ==========================================
// MORTGAGE CALCULATOR
// ==========================================
function initCalculator() {
  const amountSlider = document.getElementById('calc_amount');
  const amountDisplay = document.getElementById('calc_amount_display');
  const rateInput = document.getElementById('calc_interest_rate');
  const rateDisplay = document.getElementById('calc_rate_display');
  const termSlider = document.getElementById('calc_months');
  const termDisplay = document.getElementById('calc_term_display');

  function calculate() {
    const P = parseFloat(amountSlider.value);
    const annualRate = parseFloat(rateInput.value);
    const n = parseInt(termSlider.value);
    const type = document.querySelector('input[name="calc_type"]:checked')?.value || 'pi';

    const r = annualRate / 100 / 12; // monthly rate
    let monthly = 0;
    let totalInterest = 0;

    if (type === 'pi') {
      // P&I: M = P * r(1+r)^n / ((1+r)^n - 1)
      if (r > 0) {
        monthly = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      } else {
        monthly = P / n;
      }
      totalInterest = monthly * n - P;
    } else {
      // Interest Only: M = P * r, last month = P + P*r
      monthly = P * r;
      totalInterest = monthly * n;
    }

    const totalRepay = P + totalInterest;

    // Update displays
    if (amountDisplay) amountDisplay.textContent = 'HK$ ' + formatNumber(P);
    if (rateDisplay) rateDisplay.textContent = annualRate.toFixed(1) + '%';
    if (termDisplay) {
      const unit = (currentLang === 'en' && n === 1) ? 'Month' : t('months');
      termDisplay.textContent = n + ' ' + unit;
    }

    const monthlyEl = document.getElementById('calc_result_monthly_payment');
    const interestEl = document.getElementById('calc_result_total_interest');
    const totalEl = document.getElementById('calc_result_total_repay');

    if (monthlyEl) monthlyEl.textContent = 'HK$ ' + formatNumber(Math.round(monthly));
    if (interestEl) interestEl.textContent = 'HK$ ' + formatNumber(Math.round(totalInterest));
    if (totalEl) totalEl.textContent = 'HK$ ' + formatNumber(Math.round(totalRepay));
  }

  // Event listeners
  [amountSlider, rateInput, termSlider].forEach(el => {
    if (el) {
      el.addEventListener('input', calculate);
      el.addEventListener('change', calculate);
    }
  });

  document.querySelectorAll('input[name="calc_type"]').forEach(radio => {
    radio.addEventListener('change', calculate);
  });

  // Initial calculation
  calculate();
}

function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
// ==========================================
// FAQ ACCORDION
// ==========================================
function initFAQ() {
  document.querySelectorAll('.faq-item__question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const wasActive = item.classList.contains('active');

      // Close all
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));

      // Toggle clicked
      if (!wasActive) item.classList.add('active');
    });
  });
}

// ==========================================
// SCROLL ANIMATIONS
// ==========================================
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
}

// ==========================================
// MODAL
// ==========================================
function showModal(title, text) {
  const overlay = document.getElementById('success-modal');
  if (!overlay) return;

  overlay.querySelector('.modal__title').textContent = title;
  overlay.querySelector('.modal__text').textContent = text;
  overlay.classList.add('active');
}

function closeModal() {
  document.getElementById('success-modal')?.classList.remove('active');
}






