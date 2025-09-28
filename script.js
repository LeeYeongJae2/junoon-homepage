// ===============================
// 📌 모바일 네비 토글
// ===============================
document.querySelector(".menu-toggle").addEventListener("click", () => {
  document.querySelector(".nav-links").classList.toggle("show");
});




// ===============================
// 📌 네비 클릭 시 스무스 스크롤 + 헤더 높이 보정
// ===============================
document.querySelectorAll(".nav-links a").forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();

    const targetId = link.getAttribute("href");
    const target = document.querySelector(targetId);

    if (target) {
      const offset = document.querySelector(".navbar").offsetHeight;
      const top = target.offsetTop - offset;

      window.scrollTo({ top: top, behavior: "smooth" });
    }
  });
});
