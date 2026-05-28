const DBAdress = "https://aiwudhaiwufdja.loca.lt";
const bypassvalue = "v1";

function setCookie(name, value, days = 30) {
    const seconds = days * 24 * 60 * 60;
    const cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; max-age=${seconds}; path=/; SameSite=Lax; Secure`;
    document.cookie = cookieString;
}

function getCookie(name) {
    const matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

function deleteCookie(name) {
    setCookie(name, "", -1);
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

let nowDay = 0;
let days = [];
let selectedDay = 1;
let gm_page = 1;
let isCircleVideoPlaying = false;

let circleVideo;
let timeDisplay;
let undercover;
let gift_open_menu;

document.addEventListener('DOMContentLoaded', async () => {

    undercover = document.getElementsByClassName('undercover')[0];
    gift_open_menu = document.getElementsByClassName('gift-open-menu')[0];

    lottie.loadAnimation({
        container: document.getElementById('sticker-container'),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: './stickers/sticker.json'
    });

    lottie.loadAnimation({
        container: document.getElementById("gift-sticker-container"),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: './stickers/gift_sticker.json'
    });

    circleVideo = document.getElementById('circle-video');
    timeDisplay = document.getElementsByClassName('circle-video-time')[0];

    if (circleVideo) {
        circleVideo.addEventListener('loadedmetadata', updateTimeTextDirectly);

        circleVideo.addEventListener('emptied', () => {
            isCircleVideoPlaying = false;
            updateTimeTextDirectly();
        });

        circleVideo.addEventListener('play', () => {
            isCircleVideoPlaying = true;
            circleVideoEveryFrame();
        });

        circleVideo.addEventListener('pause', () => {
            isCircleVideoPlaying = false;
        });
    }

    checkFirstMeet();
    await initializate();
});

function continue_gift() {
    const container_firstmeet = document.querySelector(".container_firstmeet");
    const sticker = document.getElementById("sticker-container");
    const main_container = document.querySelector(".main-container");

    if (sticker) {
        sticker.classList.add("move-sticker");
    }

    if (main_container) {
        main_container.classList.remove("opacity-zero");
        main_container.classList.add("move-calendar");
    }

    if (container_firstmeet) {
        container_firstmeet.remove();
    }

    setCookie("firstmeet", "false", 365);
}

function checkFirstMeet() {
    const container_firstmeet = document.querySelector(".container_firstmeet");
    const sticker = document.getElementById("sticker-container");
    const main_container = document.querySelector(".main-container");

    if (getCookie("firstmeet") === "false") {
        if (container_firstmeet) {
            container_firstmeet.remove();
        }

        if (sticker) {
            sticker.style.transition = "none";
            sticker.classList.add("move-sticker");
        }

        if (main_container) {
            main_container.style.transition = "none";
            main_container.classList.add("move-calendar");
        }

    } else {
        if (main_container) {
            main_container.style.transition = "none";
            main_container.classList.add("opacity-zero");

            setTimeout(() => {
                main_container.style.transition = "";
            }, 50);
        }
    }
}

function restartAnimations() {
    deleteCookie("firstmeet");
    deleteCookie("selectedDay");
    location.reload();
}

async function getAllDays() {
    try {
        const response = await fetch(DBAdress + `/get_all_days`, {
            method: 'GET',
            headers: {
                "bypass-tunnel-reminder": bypassvalue
            }
        });

        if (response.ok) {
            days = await response.json();

            const loadingScreen = document.getElementsByClassName('hover')[0];

            if (loadingScreen) {
                loadingScreen.remove();
            }

        } else if (response.status === 404) {
            console.error("Такого дня нет в базе данных");
        }

    } catch (error) {
        console.error("Ошибка сети:", error);
    }

    console.log(days);
}

function changeDay(direction) {
    const dayNumber = document.getElementById("day");

    if ((selectedDay + direction > 0) && (selectedDay + direction <= 30)) {
        selectedDay += direction;
    }

    dayNumber.textContent = selectedDay;

    setCookie("selectedDay", selectedDay, 45);

    changeGiftAnimation(selectedDay);
}

function changeGiftAnimation(day) {

    const giftAnimation = document.getElementsByClassName("giftAnimation")[0];

    if (!giftAnimation) return;

    if (!days || days.length === 0) return;

    if (!days[selectedDay - 1]) return;

    let dayValue = days[selectedDay - 1].available;

    const sources = giftAnimation.getElementsByTagName('source');

    if (dayValue === true) {
        sources[0].src = "./animations/idle.webm";
        sources[1].src = "./animations/idle.mp4";
    } else {
        sources[0].src = "./animations/opened idle.webm";
        sources[1].src = "./animations/opened idle.mp4";
    }

    giftAnimation.load();
    giftAnimation.play();
}

function getCurrentFrame(videoElement, fps = 30) {
    return Math.floor(videoElement.currentTime * fps);
}

function openGift() {

    if (!days[selectedDay - 1]) return;

    let responseData = days[selectedDay - 1];

    if (responseData.available === true) {

        const giftAnimation = document.getElementsByClassName('giftAnimation')[0];

        if (giftAnimation) {

            const sources = giftAnimation.getElementsByTagName('source');

            giftAnimation.loop = false;

            sources[0].src = "./animations/can open.webm";
            sources[1].src = "./animations/can open.mp4";

            giftAnimation.load();
            giftAnimation.play();

            function timeUpdate() {

                if (getCurrentFrame(giftAnimation) >= 6) {

                    const type = Number(days[selectedDay - 1].content.match(/type=(.*?)\/\//)?.[1]);

                    const image = days[selectedDay - 1].content.match(/png=(.*?),/)?.[1];

                    const circle_video = days[selectedDay - 1].content.match(/circle_video=(.*?),/)?.[1];

                    const compliment = days[selectedDay - 1].content.match(/compliment=(.*?),/)?.[1];

                    const giftcard = days[selectedDay - 1].content.match(/giftcard=(.*?),/)?.[1];

                    const special_data = days[selectedDay - 1].special_data;

                    openGiftMenu(
                        type,
                        image,
                        circle_video,
                        compliment,
                        giftcard,
                        special_data
                    );

                    giftAnimation.removeEventListener('timeupdate', timeUpdate);
                }
            }

            function restoreOriginal() {

                giftAnimation.loop = true;

                sources[0].src = "./animations/idle.webm";
                sources[1].src = "./animations/idle.mp4";

                giftAnimation.load();
                giftAnimation.play();

                giftAnimation.removeEventListener('ended', restoreOriginal);
            }

            giftAnimation.addEventListener('timeupdate', timeUpdate);
            giftAnimation.addEventListener('ended', restoreOriginal);
        }

    } else {

        const giftAnimation = document.getElementsByClassName('giftAnimation')[0];

        if (giftAnimation) {

            const sources = giftAnimation.getElementsByTagName('source');

            giftAnimation.loop = false;

            sources[0].src = "./animations/can't open.webm";
            sources[1].src = "./animations/can't open.mp4";

            giftAnimation.load();
            giftAnimation.play();

            giftAnimation.addEventListener('ended', function restoreOriginal() {

                giftAnimation.loop = true;

                sources[0].src = "./animations/opened idle.webm";
                sources[1].src = "./animations/opened idle.mp4";

                giftAnimation.load();
                giftAnimation.play();

                giftAnimation.removeEventListener('ended', restoreOriginal);
            });
        }
    }
}

function gm_changePage(value = 0) {

    if (gm_page + value >= 1 && gm_page + value <= 3) {
        gm_page += value;
    }

    drawGMPage();
}

function drawGMPage() {

    const circle_video = document.getElementsByClassName("circle-video")[0];
    const compliment = document.getElementsByClassName("compliment")[0];
    const giftCard = document.getElementsByClassName("giftCard")[0];

    const exit_button = document.querySelector(".gm_exit_button");

    if (gm_page === 1) {

        circle_video.classList.remove("hidden");

        compliment.classList.add("hidden");
        giftCard.classList.add("hidden");
        exit_button.classList.add("hidden");

    } else if (gm_page === 2) {

        circle_video.classList.add("hidden");

        compliment.classList.remove("hidden");

        giftCard.classList.add("hidden");
        exit_button.classList.add("hidden");

    } else if (gm_page === 3) {

        circle_video.classList.add("hidden");
        compliment.classList.add("hidden");

        giftCard.classList.remove("hidden");
        exit_button.classList.remove("hidden");
    }
}

function formatTime(seconds) {

    if (isNaN(seconds) || seconds === Infinity) return '00:00';

    const totalSeconds = Math.floor(seconds);

    const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');

    const secs = (totalSeconds % 60).toString().padStart(2, '0');

    return `${mins}:${secs}`;
}

function updateTimeTextDirectly() {

    if (circleVideo && timeDisplay) {

        const current = formatTime(circleVideo.currentTime);

        const duration = formatTime(circleVideo.duration);

        timeDisplay.textContent = `${current} / ${duration}`;
    }
}

function circleVideoEveryFrame() {

    if (circleVideo && !circleVideo.paused && !circleVideo.ended) {

        updateTimeTextDirectly();

        requestAnimationFrame(circleVideoEveryFrame);
    }
}

function playCircleVideo() {

    if (!circleVideo) return;

    if (!isCircleVideoPlaying) {
        circleVideo.play();
    } else {
        circleVideo.pause();
    }

    isCircleVideoPlaying = !isCircleVideoPlaying;
}

function cv_toTheStart() {

    if (!circleVideo) return;

    circleVideo.currentTime = 0;

    circleVideo.play();

    isCircleVideoPlaying = true;
}

function cv_back() {

    if (!circleVideo) return;

    circleVideo.currentTime -= 1;

    updateTimeTextDirectly();
}

function cv_next() {

    if (!circleVideo) return;

    circleVideo.currentTime += 1;

    updateTimeTextDirectly();
}

function openGiftMenu(Type, Image, CircleVideo, Compliment, GiftCard, SpecialData) {

    console.log(Type, Image, CircleVideo, Compliment, GiftCard, SpecialData);

    if (Type === 1 || Type === 2) {

        const sources = circleVideo.getElementsByTagName('source');

        sources[0].src = `./videos/gift_video${CircleVideo}.webm`;

        sources[1].src = `./videos/gift_video${CircleVideo}.mp4`;

        circleVideo.load();

        const compliment_text = document.getElementById("compliment-text");

        compliment_text.textContent = Compliment;

        const giftCardImg = document.getElementById("giftCardImg");

        giftCardImg.src = `./pngs/giftCards/${GiftCard}.jpg`;

    } else if (Type === 3) {
        window.location.href = "/" + SpecialData + "/index.html";
    }

    undercover.classList.add("openedGM");
    gift_open_menu.classList.add("openedGM");
}

function gm_exitMenu() {

    undercover.classList.remove("openedGM");
    gift_open_menu.classList.remove("openedGM");
}

function openCompliment() {

    const hoverElement = document.getElementById('hover');

    hoverElement.classList.add('opened');
}

function openGiftCard() {

    const hoverGiftCardElement = document.getElementById('hoverGiftCard');

    hoverGiftCardElement.classList.add('opened');
}

document.addEventListener('visibilitychange', function () {

    if (document.visibilityState === 'hidden') {
        return;
    }
});

async function initializate() {

    const now = new Date();

    if (now.getMonth() === 6) {
        nowDay = now.getDate() - 15;
    } else if (now.getMonth() === 7) {
        nowDay = now.getDate() + 14;
    } else {
        nowDay = 1;
    }

    let openedDays;
    let avalaibleDays;

    if (JSON.parse(localStorage.getItem("openedDays")) != null) {

        openedDays = JSON.parse(localStorage.getItem("openedDays"));

    } else {

        localStorage.setItem("openedDays", JSON.stringify([]));

        openedDays = [];
    }

    if (JSON.parse(localStorage.getItem("avalaibleDays")) != null) {

        avalaibleDays = JSON.parse(localStorage.getItem("avalaibleDays"));

    } else {

        localStorage.setItem("avalaibleDays", JSON.stringify([]));

        avalaibleDays = [];
    }

    if (!avalaibleDays.includes(now.getDate())) {

        avalaibleDays.push(now.getDate());

        localStorage.setItem("avalaibleDays", JSON.stringify(avalaibleDays));
    }

    if (getCookie("selectedDay") != null) {

        selectedDay = parseInt(getCookie("selectedDay"));

        if (isNaN(selectedDay) || selectedDay < 1) {
            selectedDay = 1;
        }

        if (selectedDay > nowDay) {
            selectedDay = nowDay;
        }

        const dayNumber = document.getElementById("day");

        dayNumber.textContent = selectedDay || 1;
    }

    const animationFiles = [
        'can open.mp4',
        "can't open.mp4",
        'idle.mp4',
        'opened idle.mp4',
        'can open.webm',
        "can't open.webm",
        'idle.webm',
        'opened idle.webm'
    ];

    const folderPath = './animations/';

    Promise.all(
        animationFiles.map(file =>
            fetch(folderPath + file).then(res => res.blob())
        )
    )
        .then(blobs => {
            console.log('All animations got cached', blobs);
        })
        .catch(err => console.error('Preloading error:', err));

    await getAllDays();

    changeGiftAnimation(selectedDay);
}


/* 
---TODO LIST---
    0. Plan all gifts (Can do it anytime when I wanna)
1. Add storage system (already 50/50)
2. Add gift opens system
3. Add system of circle-videos
4. Make animations system (a function for showing animations) (already 50/50)
5. Make better UX
*/