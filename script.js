const DBAdress = "https://7462-46-149-76-179.ngrok-free.app/";


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

document.addEventListener('DOMContentLoaded', () => {
    lottie.loadAnimation({
        container: document.getElementById('sticker-container'),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: './stickers/sticker.json'
    });


    checkFirstMeet();
    initializateCalendar();
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
    location.reload();
    deleteCookie("selectedDay")
}

let nowDay = 0;
let openedDays = [];
let avalaibleDays = [];
let selectedDay = 1;

function initializateCalendar() {
    const now = new Date();
    if (now.getMonth == 6) { nowDay = now.getDay - 15 }
    else if (now.getMonth == 7) { nowDay = now.getDay + 14 }

    /* Already opened days */
    if (JSON.parse(localStorage.getItem("openedDays")) != null) {
        openedDays = JSON.parse(localStorage.getItem("openedDays"))
    } else {
        localStorage.setItem("openedDays", JSON.stringify([]))
        openedDays = [];
    }

    /* Didn't opened yet days */
    if (JSON.parse(localStorage.getItem("avalaibleDays")) != null) {
        avalaibleDays = JSON.parse(localStorage.getItem("avalaibleDays"));
    } else {
        localStorage.setItem("avalaibleDays", JSON.stringify([]));
        avalaibleDays = [];
    }
    if ( !now.getDay in avalaibleDays) {
        avalaibleDays.add(now.getDay);
    }

    if (getCookie("selectedDay") != null) { 
        /* Getting selectedDay from cookies */
        selectedDay = Number(getCookie("selectedDay"));

        /* So if selectedDay is more than nowDay we change it to nowDay for better looking */
        if (selectedDay > nowDay) {
            selectedDay = nowDay;
        }

        /* Showing selectedDay in page */
        const dayNumber = document.getElementById("day");
        dayNumber.textContent = selectedDay; 
    }
}



function changeDay(days) {
    const dayNumber = document.getElementById("day");

    if ((selectedDay + days > 0) && (selectedDay + days <= 30)) { selectedDay += days }
    dayNumber.textContent = selectedDay;
    setCookie("selectedDay", selectedDay, 45);

    console.log(selectedDay)
}

async function openGift(day) {
    let responseData = null;

    try {
        const response = await fetch(`https://a8f8-62-84-98-60.ngrok-free.app{day}`);

        if (response.ok) {
            responseData = await response.json();
            console.log("Данные за день получены:", responseData);
        } else if (response.status === 404) {
            console.error("Такого дня нет в базе данных");
        }
    } catch (error) {
        console.error("Ошибка сети:", error);
    }

    if (responseData && responseData.available === true) {
        
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
                sources[0].src = "./animations/idle.webm";
                sources[1].src = "./animations/idle.mp4";
                giftAnimation.load();
                giftAnimation.play();
                giftAnimation.removeEventListener('ended', restoreOriginal);
            });
        }
    }
}




/* 
---TODO LIST---
    0. Plan all gifts (Can do it anytime when I wanna)
1. Add storage system
2. Add gift opens system
3. Add system of circle-videos
4. Make animations system (a function for showing animations)
5. Make better UX
*/