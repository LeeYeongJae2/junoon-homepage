// ✅ 셀렉터 헬퍼
const qs = (s, r = document) => r.querySelector(s);
const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));

document.addEventListener("DOMContentLoaded", () => {
  const sections = qsa(".section");
  const navLinks = qsa(".nav-links a");
  const menuToggle = qs(".menu-toggle");
  const navList = qs(".nav-links");

  // ==========================================================
  // 🌐 전 브라우저 대응형 vh 보정 (Debounce 적용)
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
  let vhTimer;
  const debounceVH = () => {
    clearTimeout(vhTimer);
    vhTimer = setTimeout(fixVH, 200);
  };
  fixVH();
  ["resize", "orientationchange"].forEach(evt => window.addEventListener(evt, debounceVH));
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", debounceVH);
    window.visualViewport.addEventListener("scroll", debounceVH);
  }
  window.addEventListener("load", () => setTimeout(fixVH, 300));

  // ==========================================================
  // ⏰ 현재 연도 자동 표시
  // ==========================================================
  const yearEl = qs("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ==========================================================
  // 📱 모바일 메뉴 토글 + 백드롭
  // ==========================================================
  let navOverlay = document.createElement("div");
  navOverlay.classList.add("nav-overlay");
  document.body.appendChild(navOverlay);

  menuToggle?.addEventListener("click", () => {
    const isOpen = navList.classList.toggle("show");
    navOverlay.classList.toggle("show", isOpen);
    document.body.classList.toggle("nav-open", isOpen);
  });

  // ✅ 메뉴 클릭 시 자동 닫힘
  navLinks.forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const target = qs(a.getAttribute("href"));
      if (target) target.scrollIntoView({ behavior: "smooth" });
      navLinks.forEach(n => n.classList.remove("active"));
      a.classList.add("active");
      navList.classList.remove("show");
      navOverlay.classList.remove("show");
      document.body.classList.remove("nav-open");
    });
  });

  // ✅ 외부 영역 클릭 시 닫기
  navOverlay.addEventListener("click", () => {
    navList.classList.remove("show");
    navOverlay.classList.remove("show");
    document.body.classList.remove("nav-open");
  });

  // ==========================================================
  // 🔍 섹션 감지 (scrollY 기반 정확도형)
  // ==========================================================
  window.addEventListener("scroll", () => {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const headerHeight = document.querySelector("header.navbar")?.offsetHeight || 80;
    const offset = scrollY + headerHeight + 100;

    let currentId = "";
    document.querySelectorAll("section[id]").forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (offset >= top && offset < top + height) currentId = section.id;
    });

    if (currentId) {
      document.querySelectorAll(".nav-links a").forEach(a => {
        a.classList.toggle("active", a.getAttribute("href").includes(currentId));
      });
    }
  });

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
    const container = track.parentElement;
    const active = items[slideIndex];
    const itemCenter = active.offsetLeft + active.offsetWidth / 2;
    const containerCenter = container.clientWidth / 2;
    const translateX = containerCenter - itemCenter;
    track.style.transition = "transform 0.6s ease";
    track.style.transform = `translateX(${translateX}px)`;
    if (indicator) indicator.textContent = `${slideIndex + 1} / ${items.length}`;
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
// 🔄 비교 섹션 캐러셀 (버튼 + 드래그 + 스와이프)
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

// ✅ 드래그 / 스와이프 기능 복구 (PC + 모바일)
let cmpStartX = 0;
let cmpDragging = false;

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
  // 🌟 후기 자동 생성 (로드 완료 후 실행)
  // ==========================================================
  const reviews = [
    { stars: 5, quote: "이선생의 줄눈작업은 정말 만족도가 높았습니다. 무엇보다 처음엔 남편이 '매일 청소하니까 필요없지 않을까?' 했었는데 , 백시멘트 누수가능성을 듣고나니 정말 잘한 선택이더라구요. 줄눈은 단순히 예쁘게 보이기 위한게 아니라, 집을 오래 안전하게 지키는 작업이라는걸 직접 경험했습니다 .", author: "김O지 고객", meta: "🏠 대구 수성구"},
    { stars: 5, quote: "저도 처음에는 '굳이 필요할까?' 라는 생각이 들었는데 지금은 왜 진작안했을까 싶어요. 줄눈하나로 욕실 분위기도 달라지고 관리도 훨씬 수월해진걸 직접 느끼게 됩니다!! 저는 워킹맘이라 집청소나 관리에 시간을 많이 못쓰는편인데 저와 비슷한 분들이라면 더욱더 만족하실 시공인거 같아요!!", author: "이O은 고객" ,meta: "🏠 울산 남구"},
    { stars: 5, quote: "친구 추천으로 이선생줄눈을 알게 되었는데 상담부터 정말 친절하셨습니다. 궁금한 점이 많았는데, 하나하나 빠르고 자세하게 알려주시는 점도 마음이 놓였어요. 또, 타일 사이사이 작은 틈까지 놓치지 않고, 친환경 좋은 제품을 사용하시니 안전하고 안심이 되더라구요. 반려동물과 아이가 있는 집이라 이런부분도 신경이 쓰였는데 세심한 부분도 캐치해주시는걸 보고 이래서 친구가 추천을 그렇게 해줬구나 싶었네요. ^^  대만족 입니다. 대구에서 줄눈 고민이신분 계신다면 저도 추천 드려요^^ ", author: "박O수 고객" ,meta: "🏠 대구 달서구"},
    { stars: 5, quote: "이사 전 집에서도 줄눈업체에 맡겨본 경험이 있는데 A/S를 세번정도 받았었죠. 그래서 줄눈 시공은 꼼꼼함이 중요하다는 점을 잘알고 있어서 열심히 찾아보니 이선생업체가 후기도 많고 믿음이 가더라고여. 이곳은 젊은 감각으로 세련된 마감까지 꼼꼼하게 챙겨주니 매우 만족하고 A/S도 필요가 없네요. 실제로 대구줄눈 업체들 중에서도 A/S 문의가 거의 없다고 하시던데, 그 이유를 알겠더라고요. 대구에서 A/S 문의가 가장 적다는 말이 실감날 정도였어요. 시공 당일에도 마치 자기 집처럼 정성스러운 작업을 해주셔서 더욱 만족스러웠습니다.", author: "오O혁 고객" ,meta: "🏠 대구 북구"},
    { stars: 5, quote: "집을 오래 쓰다 보면 타일 사이사이에 생기는 얼룩이나 곰팡이 때문에 신경 쓰이는데, 줄눈을 새로 하고나니깐 집안 전체 분위기가 한층 깔끔해졌어요. 무엇보다 줄눈 작업 후에는 곰팡이나 얼룩이 덜 생기고, 오래도록 깔끔함이 유지되는게 정말 마음에 들었습니다. 시공 후에는 공간이 훨씬 환해지고 관리도 쉬워져서 줄눈 효과를 제대로 느낄 수 있답니다.", author: "최O민 고객",meta: "🏠 구미 인동동" },
    { stars: 5, quote: "제가 줄눈시공을 결정할때 중요하게 봤던점은 꼼꼼하게 해주는 곳인지 또 시간이 지나도 변색없이 유지가잘 되는 곳인지를 잘 따져보고 결정했어요! 제가 알아본바로는 이선생줄눈이 전체적인 평이 가장 부합하고 좋더라구요! 그리고 당일에 시공하실때 잠깐 외출하고 집에 들어갔는데 정말 깜짝 놀랐어요.. 내집이 맞나 싶더라구요.. 줄눈 하나로 집이 이렇게나 달라져서 놀랐어요.. 완성된 줄눈은 깔끔하고 세련된 분위기를 주었고, 역시 전문가의 손길을 거치니까 다르더라구요.. 처음 상담할때부터해서 마무리 까지 만족도 높은 관리를 해주셔서 주변에도 아는 지인들에게도 많이 알려줬어요!!", author: "정O라 고객",meta: "🏠 포항 북구" },
  ];

  window.addEventListener("load", () => {
    const reviewContainer = qs("#reviews-container");
    if (reviewContainer) {
      reviewContainer.innerHTML = reviews.map(r => `
        <div class="review-card">
          <div class="stars">${"⭐".repeat(r.stars)}</div>
          <p class="quote">"${r.quote}"</p>
          <p class="meta">${r.meta}</p>
          <p class="author">- ${r.author}</p>
        </div>`).join("");
    }
  });

  // ==========================================================
  // ☎️ 상담 버튼
  // ==========================================================
  qsa(".contact-btn.call").forEach(btn =>
    (btn.onclick = () => (window.location.href = "tel:010-9593-7665"))
  );

  // ==========================================================
  // 💬 카카오톡 상담 버튼 (모바일 즉시 연결 + PC 팝업 + GTM)
  // ==========================================================
  qsa("#kakaoLink, .contact-btn.kakao, .mobile-kakao").forEach(kakaoBtn => {
    const kakaoOpenLink = "https://open.kakao.com/o/sJYjxMVh";
    kakaoBtn.addEventListener("click", (e) => {
      const ua = navigator.userAgent.toLowerCase();
      const isAndroid = /android/i.test(ua);
      const isIOS = /iphone|ipad|ipod/i.test(ua);

      // ✅ 모바일: 즉시 연결
      if (isAndroid || isIOS) {
        if (window.dataLayer) setTimeout(() => window.dataLayer.push({ event: "kakao_click" }), 100);
        if (isAndroid) {
          window.location.href = "intent://open.kakao.com/o/sJYjxMVh#Intent;scheme=https;package=com.kakao.talk;end";
        } else {
          window.location.href = kakaoOpenLink;
        }
        return;
      }

      // ✅ PC: QR 팝업
      e.preventDefault();
      const popup = document.createElement("div");
      popup.classList.add("kakao-popup-overlay");
      popup.innerHTML = `
        <div class="kakao-popup">
          <div class="kakao-header">
            <img src="https://cdn-icons-png.flaticon.com/512/2111/2111468.png" alt="카카오톡 아이콘" class="kakao-icon">
            <h3>이선생줄눈 상담톡</h3>
          </div>
          <div class="kakao-body">
            <p>💬 카카오톡으로 편하게 문의해보세요!<br>📱 아래 QR코드를 휴대폰으로 스캔해주세요.</p>
            <div class="qr-box">
              <img src="https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(kakaoOpenLink)}&size=180x180" alt="카카오톡 QR코드" class="qr-img">
            </div>
            <a href="${kakaoOpenLink}" target="_blank" class="kakao-popup-btn">💛 카카오톡 열기</a>
          </div>
          <button class="kakao-popup-close">✖ 닫기</button>
        </div>`;
      document.body.appendChild(popup);
      setTimeout(() => popup.querySelector(".kakao-popup-close")?.addEventListener("click", () => popup.remove()), 50);
      if (window.dataLayer) window.dataLayer.push({ event: "kakao_click" });
    });
  });

  window.addEventListener("load", updateCarousel);
});

// ==========================================================
// ✅ 이미지 자동 슬라이드 전환 (null 방어 추가)
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
  const frames = document.querySelectorAll(".img-frame img");
  const dots = document.querySelectorAll(".gallery-dots .dot");
  if (!frames.length || !dots.length) return;
  let idx = 0;
  setInterval(() => {
    if (!frames[idx] || !dots[idx]) return;
    frames[idx].classList.remove("active");
    dots[idx].classList.remove("active");
    idx = (idx + 1) % frames.length;
    frames[idx]?.classList.add("active");
    dots[idx]?.classList.add("active");
  }, 3500);
});


// ==========================================================
// 📩 문의 폼 전송 (브랜드 팝업 + 실패 시 재전송 기능 포함)
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#inquiryForm");
  const statusEl = document.querySelector("#formStatus");
  if (!form) return;

  // ✅ 브랜드 팝업 생성 함수
  const showPopup = (message, success = true, retryFn = null) => {
    const popup = document.createElement("div");
    popup.className = "popup-overlay";

    // 버튼 구성: 성공 → 1개 / 실패 → 2개
    const buttonsHTML = success
      ? `<button class="popup-close">확인</button>`
      : `
        <div class="popup-btns">
          <button class="popup-close">확인</button>
          <button class="popup-retry">다시 시도</button>
        </div>
      `;

    popup.innerHTML = `
      <div class="popup-box ${success ? "success" : "error"}">
        <div class="popup-icon">${success ? "💙" : "⚠️"}</div>
        <h3 class="popup-title">${success ? "문의 전송 완료" : "전송 실패"}</h3>
        <p class="popup-message">${message}</p>
        ${buttonsHTML}
      </div>
    `;
    document.body.appendChild(popup);

    // 닫기 버튼 동작
    const close = () => popup.remove();
    popup.querySelector(".popup-close").addEventListener("click", close);

    // 다시 시도 버튼 동작 (실패 시에만 존재)
    const retryBtn = popup.querySelector(".popup-retry");
    if (retryBtn && typeof retryFn === "function") {
      retryBtn.addEventListener("click", () => {
        close(); // 먼저 닫고
        retryFn(); // 재전송 시도
      });
    }

    // 배경 클릭 시 닫기
    popup.addEventListener("click", (e) => {
      if (e.target === popup) close();
    });

    // 성공 시에는 자동 닫힘 (5초)
    if (success) setTimeout(close, 5000);
  };

  // ✅ 전송 로직 (재시도 포함)
  const sendForm = async () => {
    const data = {
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      buildingType: form.buildingType.value,
      workArea: form.workArea.value,
      region: form.region.value.trim(),
      date: form.date.value,
      message: form.message.value.trim(),
      from_name: "이선생줄눈 고객문의",
    };

    statusEl.textContent = "문의 전송 중입니다...";
    statusEl.style.color = "#2563eb";

    try {
      await emailjs.send("service_1xbts05", "template_689v0ej", data);
      if (window.dataLayer) window.dataLayer.push({ event: "form_submit" });

      form.reset();
      statusEl.textContent = "";
      showPopup("문의가 성공적으로 전송되었습니다. 빠른 시일 내 연락드리겠습니다.", true);
    } catch (err) {
      console.error("전송 실패:", err);
      statusEl.textContent = "❌ 전송 중 오류가 발생했습니다.";
      statusEl.style.color = "red";
      showPopup(
        "전송 중 오류가 발생했습니다.<br>인터넷 연결을 확인하거나 잠시 후 다시 시도해주세요.",
        false,
        sendForm // ✅ 재전송 함수 전달
      );
    }
  };

  // ✅ 폼 제출 이벤트
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    sendForm();
  });
});



// ==========================================================
// 📊 Google Tag Manager(GTM) 클릭 트래킹 (모바일 충돌 제거 + 새창 열기)
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
  const safeTrack = (name) => {
    if (window.dataLayer && Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event: name });
      console.log("📡 GTM:", name);
    }
  };

  // ✅ 블로그 버튼 - GTM 전송 + 새창 열기
  qsa("#blogLink, .contact-btn.blog, .mobile-blog, a[href*='blog.naver']").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault(); // 기존 링크 동작 막기
      safeTrack("blog_click");

      // a태그일 경우 href 우선 사용
      const url = btn.getAttribute("href") || "https://blog.naver.com/leesungrout";
      window.open(url, "_blank"); // 새 창으로 열기
    }, { passive: false });
  });

  // ✅ 전화 버튼
  qsa(".contact-btn.call, .mobile-call, a[href^='tel:']").forEach(btn =>
    ["click", "touchstart"].forEach(evt =>
      btn.addEventListener(evt, () => safeTrack("call_click"), { passive: true })
    )
  );

  console.log("✅ GTM 트래킹 정상 (모바일 preventDefault 완전 제거 + 블로그 새창 열기)");
});
