document.addEventListener("DOMContentLoaded", () => {
  const wrapper = document.querySelector(".sections-wrapper");
  const sections = document.querySelectorAll(".section");
  const navLinks = document.querySelectorAll(".nav-links a");
  const total = sections.length;

  let currentIndex = 0, wheelDelta = 0, isLocked = false, scrollTimeout = null;
  const SCROLL_THRESHOLD = 180, SCROLL_COOLDOWN = 700;

  function setActiveNav() {
    navLinks.forEach(a => a.classList.remove("active"));
    if (navLinks[currentIndex]) navLinks[currentIndex].classList.add("active");
  }

  function getSectionHeight() {
    const header = document.querySelector("header.navbar");
    return window.innerHeight - (header ? header.offsetHeight : 0);
  }

  function goToSection(index) {
    if (index < 0 || index >= total) return;
    currentIndex = index;
    const h = getSectionHeight();
    wrapper.style.transition = "transform 0.6s ease-out";
    wrapper.style.transform = `translateY(-${h * index}px)`;
    setActiveNav();
  }
  setActiveNav();

  /* ========== 휠 스크롤 (비교섹션 내부 스크롤 허용) ========== */
  window.addEventListener("wheel", (e) => {
    if (window.innerWidth <= 1024) return;
    e.preventDefault();

    const cmp = document.getElementById("comparison");
    if (cmp && cmp.contains(e.target)) {
      const atTop = cmp.scrollTop <= 0;
      const atBottom = cmp.scrollTop + cmp.clientHeight >= cmp.scrollHeight - 1;
      if ((e.deltaY < 0 && !atTop) || (e.deltaY > 0 && !atBottom)) {
        cmp.scrollTop += e.deltaY;
        return;
      }
    }

    wheelDelta += e.deltaY;
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => (wheelDelta = 0), 60);
    if (isLocked) return;

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

  /* ========== 네비 클릭 / 모바일 메뉴 ========== */
  navLinks.forEach((a, i) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      if (window.innerWidth > 1024) goToSection(i);
      else document.querySelector(a.getAttribute("href"))?.scrollIntoView({ behavior: "smooth" });
      document.querySelector(".nav-links")?.classList.remove("show");
    });
  });
  document.querySelector(".menu-toggle")?.addEventListener("click", () =>
    document.querySelector(".nav-links")?.classList.toggle("show")
  );

  /* ========== 캐러셀 ========== */
  const track = document.querySelector(".carousel-track");
  const items = document.querySelectorAll(".carousel-item");
  const prevBtn = document.querySelector(".carousel-btn.prev");
  const nextBtn = document.querySelector(".carousel-btn.next");
  const indicator = document.querySelector(".carousel-indicator");

  let slideIndex = 0;

  // 갭/아이템/컨테이너 실측
  function getGapPx() {
    const style = getComputedStyle(track);
    return parseFloat(style.gap || "0") || 0;
  }
  function measure() {
    const first = items[0];
    const viewport = track?.parentElement; // .carousel-container
    return {
      itemW: first ? first.getBoundingClientRect().width : 0,
      gap: track ? getGapPx() : 0,
      viewW: viewport ? viewport.clientWidth : 0,
    };
  }
  function calcItemsPerView() {
    const { itemW, gap, viewW } = measure();
    if (!itemW || !viewW) return 1;
    // 한 장 폭+갭으로 몇 장 들어가는지 동적 계산
    return Math.max(1, Math.floor((viewW + gap) / (itemW + gap)));
  }
  function stepPx() {
    const { itemW, gap } = measure();
    return itemW + gap;
  }
  function maxIndex() {
    return Math.max(items.length - calcItemsPerView(), 0);
  }

  function updateCarousel() {
    const step = stepPx();
    const max = maxIndex();
    // 좌/우 클램핑
    slideIndex = Math.min(Math.max(slideIndex, 0), max);
    if (track) {
      track.style.transition = "transform 0.4s ease";
      track.style.transform = `translateX(-${step * slideIndex}px)`;
    }
    if (indicator) indicator.textContent = `${slideIndex + 1} / ${items.length}`;
  }

  function movePrev() { slideIndex -= 1; updateCarousel(); }
  function moveNext() { slideIndex += 1; updateCarousel(); }

  prevBtn?.addEventListener("click", movePrev);
  nextBtn?.addEventListener("click", moveNext);

  // 드래그/스와이프
  let startX = 0, curX = 0, dragging = false;
  function startDrag(e) {
    if (!track) return;
    dragging = true;
    startX = e.touches ? e.touches[0].clientX : e.clientX;
    track.style.transition = "none";
  }
  function onDrag(e) {
    if (!dragging || !track) return;
    curX = e.touches ? e.touches[0].clientX : e.clientX;
    const dx = curX - startX;
    const step = stepPx();
    track.style.transform = `translateX(calc(-${step * slideIndex}px + ${dx}px))`;
  }
  function endDrag() {
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

  // 최초/리사이즈/이미지로드 시 재계산
  window.addEventListener("resize", updateCarousel);
  window.addEventListener("load", updateCarousel);
  updateCarousel();

  /* ========== 후기 렌더 ========== */
  const reviews = [
    { stars: 5, quote: "욕실이 새집처럼 변했어요!", author: "김O수 고객" },
    { stars: 5, quote: "아이 키우는 집이라 위생이 걱정이었는데, 이젠 마음이 놓입니다.", author: "이O은 고객" },
    { stars: 5, quote: "시공 과정도 깔끔했고, 기사님도 친절하셨어요.", author: "박O수 고객" },
    { stars: 5, quote: "집안 분위기가 확 바뀌었어요. 너무 고급스러워요!", author: "오O혁 고객" }
  ];
  const container = document.getElementById("reviews-container");
  if (container) {
    container.innerHTML = reviews.map(r => `
      <div class="review-card">
        <div class="stars">${"⭐".repeat(r.stars)}</div>
        <p class="quote">"${r.quote}"</p>
        <p class="author">- ${r.author}</p>
      </div>`).join("");
  }
});
