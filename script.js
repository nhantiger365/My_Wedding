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
        schedulePresentationScroll();
    }, 1500);
}

openInvitation.addEventListener("click", revealInvitation);
openHint.addEventListener("click", revealInvitation);

if (sessionStorage.getItem("invitationOpened") === "true") {
    gate.remove();
    document.body.classList.remove("locked");
}

const presentationStops = [
    "#intro",
    ".countdown-section",
    "#families",
    "#event",
    "#story",
    "#gallery",
    ".film",
    ".closing"
].map((selector) => document.querySelector(selector)).filter(Boolean);
const presentationHome = document.querySelector("#home");
const presentationDelay = 45000;
let presentationIndex = 0;
let presentationTimer;

function schedulePresentationScroll() {
    clearTimeout(presentationTimer);

    presentationTimer = setTimeout(() => {
        if (lightbox.open || videoModal.open) {
            schedulePresentationScroll();
            return;
        }

        const nextSection = presentationIndex < presentationStops.length
            ? presentationStops[presentationIndex]
            : presentationHome;

        nextSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
        presentationIndex = presentationIndex < presentationStops.length
            ? presentationIndex + 1
            : 0;
        schedulePresentationScroll();
    }, presentationDelay);
}

function syncPresentationWithCurrentPosition() {
    const nextIndex = presentationStops.findIndex((section) => section.getBoundingClientRect().top > window.innerHeight * 0.35);
    presentationIndex = nextIndex === -1 ? presentationStops.length : nextIndex;
    schedulePresentationScroll();
}

["wheel", "touchstart", "keydown"].forEach((eventName) => {
    window.addEventListener(eventName, syncPresentationWithCurrentPosition, { passive: true });
});

if (sessionStorage.getItem("invitationOpened") === "true") {
    schedulePresentationScroll();
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
const lightboxCounter = document.querySelector("#lightboxCounter");
const galleryItems = [...document.querySelectorAll(".gallery-item")];
let currentImageIndex = 0;
let touchStartX = 0;

function showGalleryImage(index) {
    currentImageIndex = (index + galleryItems.length) % galleryItems.length;
    const item = galleryItems[currentImageIndex];
    lightboxImage.src = item.dataset.image;
    lightboxImage.alt = item.querySelector("img").alt;
    lightboxCounter.textContent = `${String(currentImageIndex + 1).padStart(2, "0")} / ${String(galleryItems.length).padStart(2, "0")}`;
}

galleryItems.forEach((item, index) => {
    item.addEventListener("click", () => {
        showGalleryImage(index);
        lightbox.showModal();
    });
});

document.querySelector("#closeLightbox").addEventListener("click", () => lightbox.close());
document.querySelector("#previousImage").addEventListener("click", () => showGalleryImage(currentImageIndex - 1));
document.querySelector("#nextImage").addEventListener("click", () => showGalleryImage(currentImageIndex + 1));

lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) lightbox.close();
});

lightbox.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") showGalleryImage(currentImageIndex - 1);
    if (event.key === "ArrowRight") showGalleryImage(currentImageIndex + 1);
});

lightbox.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0].clientX;
}, { passive: true });

lightbox.addEventListener("touchend", (event) => {
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) < 50) return;
    showGalleryImage(currentImageIndex + (distance < 0 ? 1 : -1));
}, { passive: true });

const videoModal = document.querySelector("#videoModal");
const weddingFilm = document.querySelector("#weddingFilm");
const weddingFilmUrl = "https://www.youtube-nocookie.com/embed/ieLVZYATjxk?autoplay=1&rel=0";

function openWeddingFilm() {
    audio.pause();
    setMusicState(false);
    weddingFilm.src = weddingFilmUrl;
    videoModal.showModal();
}

function closeWeddingFilm() {
    videoModal.close();
    weddingFilm.src = "";
}

document.querySelector("#playFilm").addEventListener("click", openWeddingFilm);
document.querySelector("#closeVideo").addEventListener("click", closeWeddingFilm);
videoModal.addEventListener("click", (event) => {
    if (event.target === videoModal) closeWeddingFilm();
});
videoModal.addEventListener("close", () => {
    weddingFilm.src = "";
});

musicToggle.addEventListener("click", () => {
    if (audio.paused) {
        playWeddingMusic();
    } else {
        audio.pause();
        setMusicState(false);
    }
});
