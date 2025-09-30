// fullPage.js 초기화
new fullpage('#fullpage', {
  autoScrolling: true,
  scrollHorizontally: false,
  navigation: true,
  navigationPosition: 'right',
  scrollingSpeed: 700,
  responsiveWidth: 1024,

  afterLoad: function (origin, destination, direction) {
    const section = destination.item;

    // 🔽 내려갈 때만 등장 애니메이션
    if (direction === 'down' && !section.classList.contains('is-in')) {
      section.classList.add('is-in');
      section.querySelectorAll('.anim').forEach((el) => {
        const delay = el.dataset.delay || 0;
        el.style.transitionDelay = `${delay}ms`;
      });
    }

    // ✅ 캐러셀 강제 리렌더링 — 약간의 지연을 줘야 정상 동작
    setTimeout(() => {
      const carousel = section.querySelector('.carousel-track');
      if (carousel && typeof updateCarousel === 'function') {
        updateCarousel(); // 가시화된 상태에서 정확한 clientWidth 계산
      }
    }, 100); // 딜레이 없이 실행하면 width가 0인 상태일 수 있음
  }
});

// 모바일 메뉴 토글
document.querySelector('.menu-toggle')?.addEventListener('click', () => {
  document.querySelector('.nav-links')?.classList.toggle('show');
});

// 네비게이션 클릭 시 모바일 메뉴 닫기
document.querySelectorAll('.nav-links a').forEach((a) => {
  a.addEventListener('click', () => {
    document.querySelector('.nav-links')?.classList.remove('show');
  });
});

///////////// 캐러셀 /////////////
document.addEventListener("DOMContentLoaded", () => {
  const track = document.querySelector(".carousel-track");
  const items = document.querySelectorAll(".carousel-item");
  const prevBtn = document.querySelector(".carousel-btn.prev");
  const nextBtn = document.querySelector(".carousel-btn.next");
  const indicator = document.querySelector(".carousel-indicator");

  let index = 0;
  let itemsPerView = getItemsPerView();
  const total = items.length;
  let startX = 0, currentTranslate = 0, prevTranslate = 0, isDragging = false, animationID;
  let autoSlideInterval;

  // ✅ 외부에서 접근 가능하도록 전역 등록
  window.updateCarousel = function () {
    itemsPerView = getItemsPerView();
    const slideWidth = track.clientWidth / itemsPerView;
    currentTranslate = -index * slideWidth;
    prevTranslate = currentTranslate;
    track.style.transform = `translateX(${currentTranslate}px)`;
    indicator.textContent = `${index + 1} / ${total}`;
  };

  function getItemsPerView() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  function movePrev() {
    index = Math.max(index - 1, 0);
    updateCarousel();
  }

  function moveNext() {
    index = Math.min(index + 1, total - itemsPerView);
    updateCarousel();
  }

  prevBtn?.addEventListener("click", () => {
    movePrev();
    resetAutoSlide();
  });

  nextBtn?.addEventListener("click", () => {
    moveNext();
    resetAutoSlide();
  });

  track.addEventListener("mousedown", startDrag);
  track.addEventListener("touchstart", startDrag, { passive: true });

  function startDrag(e) {
    isDragging = true;
    startX = e.type.includes("mouse") ? e.pageX : e.touches[0].pageX;
    animationID = requestAnimationFrame(animation);
    track.style.transition = "none";
    resetAutoSlide();
  }

  track.addEventListener("mousemove", drag);
  track.addEventListener("touchmove", drag, { passive: true });

  function drag(e) {
    if (!isDragging) return;
    const currentX = e.type.includes("mouse") ? e.pageX : e.touches[0].pageX;
    const deltaX = currentX - startX;
    currentTranslate = prevTranslate + deltaX;
  }

  track.addEventListener("mouseup", endDrag);
  track.addEventListener("mouseleave", endDrag);
  track.addEventListener("touchend", endDrag);

  function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    cancelAnimationFrame(animationID);

    const movedBy = currentTranslate - prevTranslate;
    const slideWidth = track.clientWidth / itemsPerView;

    if (movedBy < -50 && index < total - itemsPerView) index++;
    if (movedBy > 50 && index > 0) index--;

    track.style.transition = "transform 0.3s ease";
    updateCarousel();
    resetAutoSlide();
  }

  function animation() {
    if (isDragging) {
      track.style.transform = `translateX(${currentTranslate}px) translateZ(0)`;
      requestAnimationFrame(animation);
    }
  }

  function startAutoSlide() {
    autoSlideInterval = setInterval(() => {
      if (index < total - itemsPerView) {
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
});
