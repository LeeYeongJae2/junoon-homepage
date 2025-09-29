// ===============================
// 📌 fullPage.js 초기화
// ===============================
new fullpage('#fullpage', {
  autoScrolling: true,
  scrollHorizontally: false,
  navigation: true,
  navigationPosition: 'right',
  scrollingSpeed: 700,

  afterLoad: function(origin, destination, direction) {
    const section = destination.item;
    section.classList.add("is-in");
    section.querySelectorAll(".anim").forEach(el => {
      const delay = el.dataset.delay || 0;
      el.style.transitionDelay = `${delay}ms`;
    });
  },

  onLeave: function(origin, destination, direction) {
    origin.item.classList.remove("is-in");
  }
});

// ===============================
// 📌 모바일 네비 토글
// ===============================
document.querySelector(".menu-toggle")?.addEventListener("click", () => {
  document.querySelector(".nav-links").classList.toggle("show");
});
