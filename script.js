// ✅ 셀렉터 헬퍼
const qs = (s, r = document) => r.querySelector(s);
const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));

document.addEventListener("DOMContentLoaded", () => {
  const sections   = qsa(".section");
  const navLinks   = qsa(".nav-links a");
  const menuToggle = qs(".menu-toggle");
  const navList    = qs(".nav-links");

  // ==========================================================
  // 🌐 전 브라우저 대응형 vh 보정 (Safari, Chrome, Edge, Android 완전 대응)
  // ==========================================================
  const fixVH = () => {
    try {
      const viewport = window.visualViewport || window;
      const vh = viewport.height * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    } catch (e) {
      document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
    }
  };
  fixVH();
  ["resize", "orientationchange"].forEach(evt =>
    window.addEventListener(evt, () => setTimeout(fixVH, 200))
  );
  window.addEventListener("load", () => {
    fixVH();
    setTimeout(fixVH, 500);
  });
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", () => setTimeout(fixVH, 200));
    window.visualViewport.addEventListener("scroll", () => setTimeout(fixVH, 200));
  }
  window.addEventListener("load", () => setTimeout(fixVH, 300));

  // ==========================================================
  // ⏰ 현재 연도 자동 표시
  // ==========================================================
  const yearEl = qs("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ==========================================================
  // 📱 모바일 메뉴 토글
  // ==========================================================
  menuToggle?.addEventListener("click", () => {
    navList.classList.toggle("show");
  });

  // 메뉴 클릭 시 섹션 이동 + active 표시
  navLinks.forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const target = qs(a.getAttribute("href"));
      if (target) target.scrollIntoView({ behavior: "smooth" });
      navLinks.forEach(n => n.classList.remove("active"));
      a.classList.add("active");
      navList.classList.remove("show");
    });
  });

  // ==========================================================
  // 🔍 IntersectionObserver로 현재 섹션 감지 (네비 연동)
  // ==========================================================
  const io = new IntersectionObserver((entries) => {
    const visible = entries.find(e => e.isIntersecting);
    if (!visible) return;
    const idx = sections.indexOf(visible.target);
    if (idx >= 0) {
      navLinks.forEach(n => n.classList.remove("active"));
      if (navLinks[idx]) navLinks[idx].classList.add("active");
    }
  }, { threshold: 0.6 });
  sections.forEach(s => io.observe(s));

  // ==========================================================
  // 🏠 시공 사례 캐러셀 (중앙 정렬 + 순환 + 스와이프)
  // ==========================================================
  const track = qs(".carousel-track");
  const items = qsa(".carousel-item");
  const prevBtn = qs(".carousel-btn.prev");
  const nextBtn = qs(".carousel-btn.next");
  const indicator = qs(".carousel-indicator");
  let slideIndex = 0;

  function updateCarousel() {
  if (!items.length) return;

  const container = track.parentElement;
  const containerWidth = container.offsetWidth;
  const itemWidth = items[0].offsetWidth;
  const gap = parseFloat(getComputedStyle(track).gap) || 0;

  // ✅ 중앙 정렬 계산 (패딩 보정 제거, 실제 픽셀 기준)
  const centerOffset = (containerWidth - itemWidth) / 2;
  const baseTranslate = slideIndex * (itemWidth + gap);

  // ✅ 부드러운 이동
  track.style.transition = "transform 0.6s ease";
  track.style.transform = `translateX(${centerOffset - baseTranslate}px)`;

  // ✅ 인디케이터 업데이트
  if (indicator) indicator.textContent = `${slideIndex + 1} / ${items.length}`;

  // ✅ 강조 효과 적용
  items.forEach((item, i) => {
    if (i === slideIndex) {
      item.classList.add("active");
      item.style.zIndex = "3";
    } else {
      item.classList.remove("active");
      item.style.zIndex = "1";
    }
  });
}


  // ✅ 순환 이동 버튼
  prevBtn?.addEventListener("click", () => {
    slideIndex = (slideIndex - 1 + items.length) % items.length;
    updateCarousel();
  });
  nextBtn?.addEventListener("click", () => {
    slideIndex = (slideIndex + 1) % items.length;
    updateCarousel();
  });

  // ✅ 드래그 / 스와이프
  let startX = 0, isDragging = false;
  track?.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.clientX;
    track.style.transition = "none";
  });
  window.addEventListener("mouseup", () => (isDragging = false));
  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 80) {
      if (dx < 0) nextBtn?.click();
      else prevBtn?.click();
      isDragging = false;
    }
  });

  let touchStartX = 0;
  track?.addEventListener("touchstart", (e) => (touchStartX = e.touches[0].clientX), { passive: true });
  track?.addEventListener("touchend", (e) => {
    const dx = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 60) {
      if (dx > 0) nextBtn?.click();
      else prevBtn?.click();
    }
  }, { passive: true });

  updateCarousel();
  window.addEventListener("resize", updateCarousel);

  // ==========================================================
  // 🔄 비교 섹션 캐러셀 (기존 유지)
  // ==========================================================
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

  // ✅ 드래그 / 스와이프
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

  // ==========================================================
  // 🌟 후기 자동 생성
  // ==========================================================
  const reviews = [
    { stars: 5, quote: "욕실이 새집처럼 변했어요! 100% 만족입니다.", author: "김O수 고객" },
    { stars: 5, quote: "아이 키우는 집이라 위생 걱정이 사라졌어요!", author: "이O은 고객" },
    { stars: 5, quote: "시공도 깔끔하고 상담도 친절했습니다.", author: "박O수 고객" },
    { stars: 5, quote: "집이 훨씬 고급스러워졌어요.", author: "오O혁 고객" },
    { stars: 5, quote: "시공 후 관리 방법까지 꼼꼼히 안내해주셔서 믿음이 갔어요.", author: "정O라 고객" },
    { stars: 5, quote: "작업 후 곰팡이 냄새가 완전히 사라졌어요. 정말 만족합니다!", author: "최O민 고객" },
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

  // ==========================================================
  // ☎️ 상담 버튼
  // ==========================================================
  qsa(".contact-btn.call").forEach(
    (btn) => (btn.onclick = () => (window.location.href = "tel:010-9593-7665"))
  );
});
