const gate = document.querySelector("#invitationGate");
const envelope = document.querySelector("#envelope");
const openInvitation = document.querySelector("#openInvitation");
const openHint = document.querySelector("#openHint");
const audio = document.querySelector("#weddingMusic");
const musicToggle = document.querySelector("#musicToggle");

function setMusicState(playing) {
    if (playing) {
        musicToggle.classList.add("playing");
        musicToggle.querySelector(":scope > span:last-child").textContent = "Playing";
    } else {
        musicToggle.classList.remove("playing");
        musicToggle.querySelector(":scope > span:last-child").textContent = "Music";
    }
}

function playWeddingMusic() {
    audio.volume = 0.55;
    audio.play().then(() => setMusicState(true)).catch(() => setMusicState(false));
}

function revealInvitation() {
    if (envelope.classList.contains("open")) return;

    // Start audio inside the click event so browser autoplay policies allow it.
    playWeddingMusic();
    envelope.classList.add("open");
    setTimeout(() => {
        gate.classList.add("opened");
        document.body.classList.remove("locked");
        sessionStorage.setItem("invitationOpened", "true");
    }, 1500);
}

openInvitation.addEventListener("click", revealInvitation);
openHint.addEventListener("click", revealInvitation);

if (sessionStorage.getItem("invitationOpened") === "true") {
    gate.remove();
    document.body.classList.remove("locked");
}

const weddingDate = new Date("2026-07-19T10:00:00+07:00").getTime();
const countdownParts = {
    days: document.querySelector("#days"),
    hours: document.querySelector("#hours"),
    minutes: document.querySelector("#minutes"),
    seconds: document.querySelector("#seconds")
};

function updateCountdown() {
    const distance = Math.max(0, weddingDate - Date.now());
    const values = {
        days: Math.floor(distance / 86400000),
        hours: Math.floor((distance % 86400000) / 3600000),
        minutes: Math.floor((distance % 3600000) / 60000),
        seconds: Math.floor((distance % 60000) / 1000)
    };

    Object.entries(values).forEach(([key, value]) => {
        countdownParts[key].textContent = String(value).padStart(2, "0");
    });
}

updateCountdown();
setInterval(updateCountdown, 1000);

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightboxImage");
document.querySelectorAll(".gallery-item").forEach((item) => {
    item.addEventListener("click", () => {
        lightboxImage.src = item.dataset.image;
        lightbox.showModal();
    });
});
document.querySelector("#closeLightbox").addEventListener("click", () => lightbox.close());
lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) lightbox.close();
});

const videoModal = document.querySelector("#videoModal");
document.querySelector("#playFilm").addEventListener("click", () => videoModal.showModal());
document.querySelector("#closeVideo").addEventListener("click", () => videoModal.close());
videoModal.addEventListener("click", (event) => {
    if (event.target === videoModal) videoModal.close();
});

musicToggle.addEventListener("click", () => {
    if (audio.paused) {
        playWeddingMusic();
    } else {
        audio.pause();
        setMusicState(false);
    }
});
