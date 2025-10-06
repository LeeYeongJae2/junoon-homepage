// ===== Utilities =====
const qs = (s, r=document) => r.querySelector(s);
const qsa = (s, r=document) => Array.from(r.querySelectorAll(s));

document.addEventListener("DOMContentLoaded", () => {
  const wrapper   = qs(".sections-wrapper");
  const sections  = qsa(".section");
  const navLinks  = qsa(".nav-links a");
  const total     = sections.length;

  let currentIndex   = 0;
  let wheelDelta     = 0;
  let isLocked       = false;
  let scrollTimeout  = null;

  const SCROLL_THRESHOLD = 180;
  const SCROLL_COOLDOWN  = 700;

  const CMP_IDX = sections.findIndex(s => s.id === "comparison");
  let cmpStopOnce = false;

  // ===== Footer Year =====
  const yearEl = qs('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ===== Active Nav =====
  function setActiveNav(index = currentIndex) {
    navLinks.forEach(a => a.classList.remove("active"));
    if (navLinks[index]) navLinks[index].classList.add("active");
  }
  setActiveNav();

  // ===== Section Height =====
  function getSectionHeight() {
    const header = qs("header.navbar");
    return window.innerHeight - (header ? header.offsetHeight : 0);
  }

  // ===== Go To Section =====
  function goToSection(index) {
    if (index < 0 || index >= total) return;
    currentIndex = index;
    const h = getSectionHeight();

    if (window.innerWidth > 1024) {
      wrapper.style.transition = "transform 0.6s ease-out";
      wrapper.style.transform  = `translateY(-${h * index}px)`;
    } else {
      sections[index]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    cmpStopOnce = (index === CMP_IDX); // 비교 섹션 진입시 첫 스크롤 멈춤
    const cmp = sections[CMP_IDX];
    if (cmp) cmp.scrollTop = 0;

    setActiveNav();
  }

  // ===== Hash 딥링크 =====
  if (location.hash) {
    const idx = sections.findIndex(s => `#${s.id}` === location.hash);
    if (idx >= 0) goToSection(idx);
  }

  // ===== Wheel Scroll (Desktop Only) =====
  window.addEventListener("wheel", (e) => {
    if (window.innerWidth <= 1024) return; // 모바일은 네이티브 스크롤
    e.preventDefault();
    if (isLocked) return;

    const cmpSection = sections[CMP_IDX];
    const cmpInner   = cmpSection?.querySelector(".comparison-inner");

    // 비교 섹션 내부 스크롤
    if (currentIndex === CMP_IDX && cmpInner) {
      const scrollable = cmpInner.scrollHeight - cmpInner.clientHeight;
      const atTop    = cmpInner.scrollTop <= 0;
      const atBottom = cmpInner.scrollTop >= scrollable - 1;

      // 처음 진입 시 한 번 멈춤
      if (cmpStopOnce) {
        cmpStopOnce = false;
        return;
      }

      if (scrollable > 5) {
        // 내부 스크롤 허용
        if ((e.deltaY < 0 && !atTop) || (e.deltaY > 0 && !atBottom)) {
          cmpInner.scrollTop += e.deltaY;
          return;
        }
        // 끝에 도달 시 다음/이전 섹션으로 이동
        if (e.deltaY > 0 && atBottom) goToSection(currentIndex + 1);
        if (e.deltaY < 0 && atTop) goToSection(currentIndex - 1);
        return;
      }
    }

    // 일반 섹션 전환
    wheelDelta += e.deltaY;
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => (wheelDelta = 0), 60);

    if (wheelDelta > SCROLL_THRESHOLD) {
      isLocked = true;
      goToSection(currentIndex + 1);
      setTimeout(() => { isLocked = false; wheelDelta = 0; }, SCROLL_COOLDOWN);
    } else if (wheelDelta < -SCROLL_THRESHOLD) {
      isLocked = true;
      goToSection(currentIndex - 1);
      setTimeout(() => { isLocked = false; wheelDelta = 0; }, SCROLL_COOLDOWN);
    }
  }, { passive: false });

  // ===== Nav Click / Mobile Menu =====
  const navList   = qs(".nav-links");
  const menuToggle = qs(".menu-toggle");

  navLinks.forEach((a, i) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      if (window.innerWidth > 1024) goToSection(i);
      else qs(a.getAttribute("href"))?.scrollIntoView({ behavior: "smooth" });
      navList?.classList.remove("show");
      menuToggle?.setAttribute("aria-expanded", "false");
    });
  });

  menuToggle?.addEventListener("click", () => {
    const isOpen = navList?.classList.toggle("show");
    menuToggle.setAttribute("aria-expanded", String(!!isOpen));
  });

  // ===== Intersection Observer (모바일용 Active Nav 동기화) =====
  const io = new IntersectionObserver((entries) => {
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a,b)=> b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    const idx = sections.indexOf(visible.target);
    if (idx >= 0) { currentIndex = idx; setActiveNav(idx); }
  }, { rootMargin: "-30% 0px -60% 0px", threshold: [0, .25, .5, .75, 1] });
  sections.forEach(s => io.observe(s));

  // ===== Carousel =====
  const track      = qs(".carousel-track");
  const items      = qsa(".carousel-item");
  const prevBtn    = qs(".carousel-btn.prev");
  const nextBtn    = qs(".carousel-btn.next");
  const indicator  = qs(".carousel-indicator");

  let slideIndex = 0;
  let startX = 0, curX = 0, dragging = false;

  function getGapPx() { return parseFloat(getComputedStyle(track).gap || "0") || 0; }
  function measure() {
    const first    = items[0];
    const viewport = track?.parentElement;
    return {
      itemW: first ? first.getBoundingClientRect().width : 0,
      gap:   track ? getGapPx() : 0,
      viewW: viewport ? viewport.clientWidth : 0,
    };
  }
  function calcItemsPerView() {
    const { itemW, gap, viewW } = measure();
    if (!itemW || !viewW) return 1;
    return Math.max(1, Math.floor((viewW + gap) / (itemW + gap)));
  }
  function stepPx() { const { itemW, gap } = measure(); return itemW + gap; }
  function maxIndex() { return Math.max(items.length - calcItemsPerView(), 0); }

  function updateCarousel() {
    const step = stepPx();
    const max  = maxIndex();
    slideIndex = Math.min(Math.max(slideIndex, 0), max);
    if (track) {
      track.style.transition = "transform 0.4s ease";
      track.style.transform  = `translateX(-${step * slideIndex}px)`;
    }
    if (indicator) indicator.textContent = `${slideIndex + 1} / ${items.length}`;
  }
  function movePrev() { slideIndex -= 1; updateCarousel(); }
  function moveNext() { slideIndex += 1; updateCarousel(); }

  prevBtn?.addEventListener("click", movePrev);
  nextBtn?.addEventListener("click", moveNext);

  // 드래그/스와이프
  function startDrag(e){
    if (!track) return;
    dragging = true;
    startX = e.touches ? e.touches[0].clientX : e.clientX;
    track.style.transition = "none";
  }
  function onDrag(e){
    if (!dragging || !track) return;
    curX = e.touches ? e.touches[0].clientX : e.clientX;
    const dx = curX - startX;
    const step = stepPx();
    track.style.transform = `translateX(calc(-${step * slideIndex}px + ${dx}px))`;
  }
  function endDrag(){
    if (!dragging) return;
    dragging = false;
    const dx = curX - startX;
    const threshold = 60;
    if (Math.abs(dx) > threshold) (dx < 0 ? moveNext() : movePrev());
    else updateCarousel();
  }
  track?.addEventListener("mousedown", startDrag);
  track?.addEventListener("mousemove", onDrag);
  track?.addEventListener("mouseup", endDrag);
  track?.addEventListener("mouseleave", endDrag);
  track?.addEventListener("touchstart", startDrag, { passive: true });
  track?.addEventListener("touchmove", onDrag, { passive: true });
  track?.addEventListener("touchend", endDrag);

  // 키보드 접근성
  track?.setAttribute("tabindex", "0");
  track?.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft")  { e.preventDefault(); movePrev(); }
    if (e.key === "ArrowRight") { e.preventDefault(); moveNext(); }
    if (e.key === "Home")       { e.preventDefault(); slideIndex = 0; updateCarousel(); }
    if (e.key === "End")        { e.preventDefault(); slideIndex = maxIndex(); updateCarousel(); }
  });

  // 최초/리사이즈/로드 시 재계산
  window.addEventListener("resize", updateCarousel);
  window.addEventListener("load", updateCarousel);
  updateCarousel();

  // ===== 후기 렌더링 =====
  const reviews = [
    { stars: 5, quote: "욕실이 새집처럼 변했어요!", author: "김O수 고객" },
    { stars: 5, quote: "아이 키우는 집이라 위생이 걱정이었는데, 이젠 마음이 놓입니다.", author: "이O은 고객" },
    { stars: 5, quote: "시공 과정도 깔끔했고, 기사님도 친절하셨어요.", author: "박O수 고객" },
    { stars: 5, quote: "집안 분위기가 확 바뀌었어요. 너무 고급스러워요!", author: "오O혁 고객" }
  ];
  const container = qs("#reviews-container");
  if (container) {
    container.innerHTML = reviews.map(r => `
      <article class="review-card" aria-label="고객 후기">
        <div class="stars" aria-hidden="true">${"⭐".repeat(r.stars)}</div>
        <p class="quote">"${r.quote}"</p>
        <p class="author">- ${r.author}</p>
      </article>`).join("");
  }
});
