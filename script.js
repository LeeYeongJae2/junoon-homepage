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

  // 초기 1회 실행
  fixVH();

  // ✅ 리사이즈 / 방향전환 / 스크롤(주소창 표시 변화) 감지
  ["resize", "orientationchange"].forEach(evt =>
    window.addEventListener(evt, () => setTimeout(fixVH, 200))
  );

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", () => setTimeout(fixVH, 200));
    window.visualViewport.addEventListener("scroll", () => setTimeout(fixVH, 200));
  }

  // ✅ 페이지 로드 완료 시 한 번 더 보정
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
  // 🏠 시공 사례 캐러셀
  // ==========================================================
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

  // 드래그 / 스와이프
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

  // ==========================================================
  // 🔄 비교 섹션 캐러셀
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
