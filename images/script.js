// 스크롤 애니메이션 효과
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll("section, .service, .gallery img, blockquote")
  .forEach(el => {
    el.classList.add("hidden");
    observer.observe(el);
    
  });
