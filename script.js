// ============================================================
// 배민 스타일 풀페이지 스크롤
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  const wrapper = document.querySelector(".sections-wrapper");
  const sections = document.querySelectorAll(".section");
  const total = sections.length;
  const navLinks = document.querySelectorAll(".nav-links a");

  let currentIndex = 0;
  let isScrolling = false;
  const SCROLL_DELAY = 900;

  function setActiveNav() {
    navLinks.forEach(link => link.classList.remove("active"));
    if (navLinks[currentIndex]) {
      navLinks[currentIndex].classList.add("active");
    }
  }

  function goToSection(index) {
    if (index < 0 || index >= total) return;
    currentIndex = index;
    wrapper.style.transform = `translateY(-${100 * currentIndex}vh)`;
    isScrolling = true;
    setActiveNav();
    setTimeout(() => { isScrolling = false; }, SCROLL_DELAY);
  }

  // 초기 active 세팅
  setActiveNav();

  // 휠/트랙패드
  window.addEventListener("wheel", (e) => {
    if (isScrolling) return;
    if (e.deltaY > 0) goToSection(currentIndex + 1);
    else if (e.deltaY < 0) goToSection(currentIndex - 1);
    e.preventDefault();
  }, { passive: false });

  // 모바일 스와이프
  let startY = 0;
  window.addEventListener("touchstart", (e) => {
    startY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener("touchend", (e) => {
    if (isScrolling) return;
    const endY = e.changedTouches[0].clientY;
    const deltaY = endY - startY;
    if (Math.abs(deltaY) > 50) {
      if (deltaY < 0) goToSection(currentIndex + 1);
      else goToSection(currentIndex - 1);
    }
  }, { passive: true });

  // 네비게이션 클릭 이동
  navLinks.forEach((a, i) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      goToSection(i);
      document.querySelector('.nav-links')?.classList.remove('show');
    });
  });

  // 모바일 메뉴 토글
  document.querySelector('.menu-toggle')?.addEventListener('click', () => {
    document.querySelector('.nav-links')?.classList.toggle('show');
  });

  // ============================================================
  // 캐러셀
  // ============================================================
  const track = document.querySelector(".carousel-track");
  const items = document.querySelectorAll(".carousel-item");
  const prevBtn = document.querySelector(".carousel-btn.prev");
  const nextBtn = document.querySelector(".carousel-btn.next");
  const indicator = document.querySelector(".carousel-indicator");

  let index = 0;
  let itemsPerView = getItemsPerView();
  const totalItems = items.length;
  let startX = 0, currentTranslate = 0, prevTranslate = 0, isDragging = false, animationID;
  let autoSlideInterval;

  function updateCarousel() {
    if (!track) return;
    itemsPerView = getItemsPerView();
    const slideWidth = track.clientWidth / itemsPerView;
    currentTranslate = -index * slideWidth;
    prevTranslate = currentTranslate;
    track.style.transform = `translateX(${currentTranslate}px)`;
    if (indicator) indicator.textContent = `${Math.min(index + 1, totalItems)} / ${totalItems}`;
  }

  function getItemsPerView() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  function movePrev() { index = Math.max(index - 1, 0); updateCarousel(); }
  function moveNext() { index = Math.min(index + 1, totalItems - itemsPerView); updateCarousel(); }

  prevBtn?.addEventListener("click", () => { movePrev(); resetAutoSlide(); });
  nextBtn?.addEventListener("click", () => { moveNext(); resetAutoSlide(); });

  track?.addEventListener("mousedown", startDrag);
  track?.addEventListener("touchstart", startDrag, { passive: true });

  function startDrag(e) {
    isDragging = true;
    startX = e.type.includes("mouse") ? e.pageX : e.touches[0].pageX;
    animationID = requestAnimationFrame(animation);
    if (track) track.style.transition = "none";
    resetAutoSlide();
  }

  track?.addEventListener("mousemove", drag);
  track?.addEventListener("touchmove", drag, { passive: true });

  function drag(e) {
    if (!isDragging || !track) return;
    const currentX = e.type.includes("mouse") ? e.pageX : e.touches[0].pageX;
    const deltaX = currentX - startX;
    currentTranslate = prevTranslate + deltaX;
  }

  track?.addEventListener("mouseup", endDrag);
  track?.addEventListener("mouseleave", endDrag);
  track?.addEventListener("touchend", endDrag);

  function endDrag() {
    if (!isDragging || !track) return;
    isDragging = false;
    cancelAnimationFrame(animationID);
    const movedBy = currentTranslate - prevTranslate;
    const slideWidth = track.clientWidth / itemsPerView;
    if (movedBy < -50 && index < totalItems - itemsPerView) index++;
    if (movedBy > 50 && index > 0) index--;
    track.style.transition = "transform 0.3s ease";
    updateCarousel();
    resetAutoSlide();
  }

  function animation() {
    if (isDragging && track) {
      track.style.transform = `translateX(${currentTranslate}px) translateZ(0)`;
      requestAnimationFrame(animation);
    }
  }

  function startAutoSlide() {
    autoSlideInterval = setInterval(() => {
      if (index < totalItems - itemsPerView) {
        index++;
      } else {
        index = 0;
      }
      updateCarousel();
    }, 6000);
  }

  function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    startAutoSlide();
  }

  window.addEventListener("resize", () => {
    itemsPerView = getItemsPerView();
    updateCarousel();
  });

  updateCarousel();
  startAutoSlide();

  // ============================================================
  // 후기 JSON 동적 렌더링
  // ============================================================
  const reviews = [
    {stars: 5, quote: "욕실이 새집처럼 변했어요! 청소도 훨씬 편리합니다.", author: "김O수 고객"},
    {stars: 5, quote: "아이 키우는 집이라 위생이 걱정이었는데, 이젠 마음이 놓입니다.", author: "이O은 고객"},
    {stars: 5, quote: "시공 과정도 깔끔했고, 기사님도 친절하셨어요.", author: "박O수 고객"},
    {stars: 5, quote: "집안 분위기가 확 바뀌었어요. 너무 고급스러워요!", author: "오O혁 고객"}
  ];
  const container = document.getElementById("reviews-container");
  reviews.forEach(r => {
    container.innerHTML += `
      <div class="review-card">
        <div class="stars">${"⭐".repeat(r.stars)}</div>
        <p class="quote">"${r.quote}"</p>
        <p class="author">- ${r.author}</p>
      </div>
    `;
  });
});
