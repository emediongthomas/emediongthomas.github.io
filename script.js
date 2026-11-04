const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector(".primary-nav");
const toast = document.querySelector(".toast");
const voiceIntroButton = document.querySelector(".button-voice");
const voiceIntroLabel = voiceIntroButton.querySelector(".voice-button-label");
const voiceIntroIcon = voiceIntroButton.querySelector(".voice-icon");
const voiceIntroStatus = document.querySelector("#voice-intro-status");
const voiceIntroAudio = document.querySelector("#voice-intro-audio");

function setTheme(theme) {
  root.dataset.theme = theme;
  themeToggle.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} theme`);
  try {
    localStorage.setItem("portfolio-theme", theme);
  } catch (error) {
    // Theme switching still works when storage is unavailable.
  }
}

try {
  const savedTheme = localStorage.getItem("portfolio-theme");
  if (savedTheme === "light" || savedTheme === "dark") {
    root.dataset.theme = savedTheme;
  }
} catch (error) {
  // Use the default theme when storage is unavailable.
}
themeToggle.setAttribute("aria-label", `Switch to ${root.dataset.theme === "dark" ? "light" : "dark"} theme`);

themeToggle.addEventListener("click", () => {
  setTheme(root.dataset.theme === "dark" ? "light" : "dark");
});

function resetVoiceIntro() {
  voiceIntroButton.setAttribute("aria-pressed", "false");
  voiceIntroLabel.textContent = "Listen to intro";
  voiceIntroIcon.textContent = "▶";
}

voiceIntroButton.addEventListener("click", async () => {
  if (voiceIntroAudio.paused) {
    try {
      await voiceIntroAudio.play();
    } catch (error) {
      voiceIntroStatus.textContent = "The voice introduction could not be played. Please try again.";
      return;
    }

    voiceIntroButton.setAttribute("aria-pressed", "true");
    voiceIntroLabel.textContent = "Stop intro";
    voiceIntroIcon.textContent = "■";
    voiceIntroStatus.textContent = "Playing the AI-generated voice introduction.";
    return;
  }

  voiceIntroAudio.pause();
  voiceIntroAudio.currentTime = 0;
  resetVoiceIntro();
  voiceIntroStatus.textContent = "Voice introduction stopped.";
});

voiceIntroAudio.addEventListener("ended", () => {
  resetVoiceIntro();
  voiceIntroStatus.textContent = "Voice introduction finished.";
});

voiceIntroAudio.addEventListener("error", () => {
  resetVoiceIntro();
  voiceIntroStatus.textContent = "The voice introduction could not be loaded.";
});

menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  primaryNav.classList.toggle("is-open", !isExpanded);
});

primaryNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle.setAttribute("aria-expanded", "false");
    primaryNav.classList.remove("is-open");
  });
});

document.querySelectorAll(".filter-button").forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    document.querySelectorAll(".filter-button").forEach((filterButton) => {
      const isActive = filterButton === button;
      filterButton.classList.toggle("is-active", isActive);
      filterButton.setAttribute("aria-pressed", String(isActive));
    });
    document.querySelectorAll(".project-card").forEach((card) => {
      const categories = card.dataset.category.split(" ");
      card.hidden = filter !== "all" && !categories.includes(filter);
    });
  });
});

const impactCounts = document.querySelectorAll(".impact-count");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function formatCount(value, format) {
  if (format === "millions") {
    return `${(value / 1000000).toFixed(value > 0 && value < 1000000 ? 1 : 0)}M`;
  }
  return String(value);
}

if ("IntersectionObserver" in window && !reducedMotion) {
  const countObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      const count = entry.target;
      const target = Number(count.dataset.count);
      const format = count.dataset.format;
      const start = performance.now();
      const duration = 1400;

      function updateCount(now) {
        const progress = Math.min((now - start) / duration, 1);
        const easedProgress = 1 - (1 - progress) ** 3;
        count.textContent = formatCount(Math.round(target * easedProgress), format);

        if (progress < 1) {
          requestAnimationFrame(updateCount);
        }
      }

      requestAnimationFrame(updateCount);
      observer.unobserve(count);
    });
  }, { threshold: 0.65 });

  impactCounts.forEach((count) => countObserver.observe(count));
}

let toastTimeout;
document.querySelector(".copy-email").addEventListener("click", async (event) => {
  const email = event.currentTarget.dataset.email;
  try {
    await navigator.clipboard.writeText(email);
    toast.textContent = "Email copied to clipboard";
  } catch (error) {
    toast.textContent = `Email: ${email}`;
  }
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
});

document.querySelector("#current-year").textContent = String(new Date().getFullYear());
