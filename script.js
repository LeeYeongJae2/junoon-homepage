// ✅ 셀렉터 헬퍼
const qs = (s, r = document) => r.querySelector(s);
const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));

document.addEventListener("DOMContentLoaded", () => {
  const sections   = qsa(".section");
  const navLinks   = qsa(".nav-links a");
  const menuToggle = qs(".menu-toggle");
  const navList    = qs(".nav-links");
  let currentIndex = 0;
  let isScrolling  = false;

  // 현재 연도
  const yearEl = qs("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // 모바일 메뉴
  menuToggle?.addEventListener("click", () => {
    navList.classList.toggle("show");
  });

  // 메뉴 클릭 → 섹션 이동
  navLinks.forEach((a, i) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const target = qs(a.getAttribute("href"));
      if (target) target.scrollIntoView({ behavior: "smooth" });
      navLinks.forEach(n => n.classList.remove("active"));
      a.classList.add("active");
      navList.classList.remove("show");
    });
  });

  // IO로 현재 섹션 감지
  const io = new IntersectionObserver((entries) => {
    const visible = entries.find(e => e.isIntersecting);
    if (!visible) return;
    const idx = sections.indexOf(visible.target);
    if (idx >= 0) {
      currentIndex = idx;
      navLinks.forEach(n => n.classList.remove("active"));
      if (navLinks[idx]) navLinks[idx].classList.add("active");
    }
  }, { threshold: 0.6 });
  sections.forEach(s => io.observe(s));

  // ✅ 데스크톱 전용 풀페이지 휠 (1281px 이상에서만 동작)
  let scrollTimer = null;
  let scrollDelta = 0;

  function sectionScrollHandler(e) {
    if (window.innerWidth < 1281) return; // 모바일/태블릿은 자연 스크롤
    e.preventDefault();
    if (isScrolling) return;
    scrollDelta += e.deltaY;
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      scrollDelta = 0;
    }, 100);

    if (scrollDelta > 100) {
      isScrolling = true;
      currentIndex = Math.min(currentIndex + 1, sections.length - 1);
      sections[currentIndex].scrollIntoView({ behavior: "smooth" });
      scrollDelta = 0;
      setTimeout(() => (isScrolling = false), 900);
    } else if (scrollDelta < -100) {
      isScrolling = true;
      currentIndex = Math.max(currentIndex - 1, 0);
      sections[currentIndex].scrollIntoView({ behavior: "smooth" });
      scrollDelta = 0;
      setTimeout(() => (isScrolling = false), 900);
    }
  }

  // ✅ 모바일에서는 wheel 이벤트 아예 제거
  if (window.innerWidth >= 1281) {
    window.addEventListener("wheel", sectionScrollHandler, { passive: false });
  }

  // ✅ 모바일/태블릿 터치 기반 섹션 이동 완전 비활성화
  // (아래 기존 코드 블록 전체 주석처리)
  /*
  if (window.innerWidth > 1280) {
    let startY = 0, endY = 0;
    window.addEventListener(
      "touchstart",
      (e) => (startY = e.touches[0].clientY),
      { passive: true }
    );
    window.addEventListener(
      "touchend",
      (e) => {
        endY = e.changedTouches[0].clientY;
        const diff = startY - endY;
        if (Math.abs(diff) < 60) return;
        if (diff > 0)
          currentIndex = Math.min(currentIndex + 1, sections.length - 1);
        else currentIndex = Math.max(currentIndex - 1, 0);
        sections[currentIndex].scrollIntoView({ behavior: "smooth" });
      },
      { passive: true }
    );
  }
  */

  // ===== 시공 사례 캐러셀 =====
  const track = qs(".carousel-track");
  const items = qsa(".carousel-item");
  const prevBtn = qs(".carousel-btn.prev");
  const nextBtn = qs(".carousel-btn.next");
  const indicator = qs(".carousel-indicator");
  let slideIndex = 0;

  function updateCarousel() {
    if (!items.length) return;
    const width = items[0].offsetWidth || 0;
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    track.style.transition = "transform .4s ease";
    track.style.transform = `translateX(-${slideIndex * (width + gap)}px)`;
    if (indicator) indicator.textContent = `${slideIndex + 1} / ${items.length}`;
  }
  prevBtn?.addEventListener("click", () => {
    slideIndex = Math.max(0, slideIndex - 1);
    updateCarousel();
  });
  nextBtn?.addEventListener("click", () => {
    slideIndex = Math.min(items.length - 1, slideIndex + 1);
    updateCarousel();
  });

  // 드래그/스와이프
  let dragStartX = 0, isDragging = false;
  track?.addEventListener("mousedown", (e) => {
    isDragging = true;
    dragStartX = e.clientX;
    track.style.transition = "none";
  });
  window.addEventListener("mouseup", () => (isDragging = false));
  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const diff = e.clientX - dragStartX;
    if (Math.abs(diff) > 80) {
      if (diff < 0) nextBtn?.click();
      else prevBtn?.click();
      isDragging = false;
    }
  });
  let touchStartX = 0;
  track?.addEventListener("touchstart", (e) => (touchStartX = e.touches[0].clientX), { passive: true });
  track?.addEventListener("touchend", (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 60) {
      if (diff > 0) nextBtn?.click();
      else prevBtn?.click();
    }
  }, { passive: true });
  updateCarousel();
  window.addEventListener("resize", updateCarousel);

  // ===== 비교 섹션 캐러셀 =====
  const cmpTrack = qs(".comparison-track");
  const cmpSlides = qsa(".comparison-slide");
  const cmpPrev = qs(".cmp-btn.prev");
  const cmpNext = qs(".cmp-btn.next");
  const cmpInd = qs(".cmp-indicator");
  let cmpIndex = 0;

  function updateComparison() {
    if (!cmpSlides.length) return;
    const width = cmpSlides[0].offsetWidth || 0;
    const gap = parseFloat(getComputedStyle(cmpTrack).gap) || 0;
    cmpTrack.style.transition = "transform .45s ease";
    cmpTrack.style.transform = `translateX(-${cmpIndex * (width + gap)}px)`;
    if (cmpInd) cmpInd.textContent = `${cmpIndex + 1} / ${cmpSlides.length}`;
  }
  cmpPrev?.addEventListener("click", () => {
    cmpIndex = (cmpIndex - 1 + cmpSlides.length) % cmpSlides.length;
    updateComparison();
  });
  cmpNext?.addEventListener("click", () => {
    cmpIndex = (cmpIndex + 1) % cmpSlides.length;
    updateComparison();
  });

  // 드래그/스와이프
  let cmpStartX = 0, cmpDragging = false;
  cmpTrack?.addEventListener("mousedown", (e) => {
    cmpDragging = true;
    cmpStartX = e.clientX;
    cmpTrack.style.transition = "none";
  });
  window.addEventListener("mouseup", () => (cmpDragging = false));
  window.addEventListener("mousemove", (e) => {
    if (!cmpDragging) return;
    const dx = e.clientX - cmpStartX;
    if (Math.abs(dx) > 70) {
      cmpIndex = (cmpIndex + (dx < 0 ? 1 : -1) + cmpSlides.length) % cmpSlides.length;
      cmpDragging = false;
      updateComparison();
    }
  });
  cmpTrack?.addEventListener("touchstart", (e) => (cmpStartX = e.touches[0].clientX), { passive: true });
  cmpTrack?.addEventListener("touchend", (e) => {
    const dx = cmpStartX - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 50) {
      cmpIndex = (cmpIndex + (dx > 0 ? 1 : -1) + cmpSlides.length) % cmpSlides.length;
      updateComparison();
    }
  }, { passive: true });
  updateComparison();
  window.addEventListener("resize", updateComparison);

  // ===== 후기 자동 생성 =====
  const reviews = [
    { stars: 5, quote: "욕실이 새집처럼 변했어요!", author: "김O수 고객" },
    { stars: 5, quote: "아이 키우는 집이라 위생 걱정이 사라졌어요!", author: "이O은 고객" },
    { stars: 5, quote: "시공도 깔끔하고 상담도 친절했습니다.", author: "박O수 고객" },
    { stars: 5, quote: "집이 훨씬 고급스러워졌어요.", author: "오O혁 고객" },
  ];
  const reviewContainer = qs("#reviews-container");
  if (reviewContainer) {
    reviewContainer.innerHTML = reviews
      .map(
        (r) => `
      <div class="review-card">
        <div class="stars">${"⭐".repeat(r.stars)}</div>
        <p class="quote">"${r.quote}"</p>
        <p class="author">- ${r.author}</p>
      </div>`
      )
      .join("");
  }

  // ===== 상담 버튼 =====
  qsa(".contact-btn.kakao").forEach((btn) =>
    btn.addEventListener("click", () =>
      window.open("https://pf.kakao.com/_yourid", "_blank")
    )
  );
  qsa(".contact-btn.call").forEach(
    (btn) => (btn.onclick = () => (window.location.href = "tel:010-9593-7665"))
  );
  qsa(".contact-btn.blog").forEach((btn) =>
    btn.addEventListener("click", () =>
      window.open("https://blog.naver.com/yourblog", "_blank")
    )
  );
});
