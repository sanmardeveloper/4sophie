const DBAdress = "https://4sophiedbserver.loca.lt";
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
let days = [];
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

    getAllDays()

}

async function getAllDays() {
    let responseData = null;

    try {
        const response = await fetch(DBAdress + `/get_all_days`, {
            method: 'GET',
            headers: {
                "bypass-tunnel-reminder" : bypassvalue
            }
        })
        if (response.ok) {
            responseData = await response.json();

            days = responseData

            const loadingScreen = document.getElementsByClassName('hover')[0]
            loadingScreen.remove()
        } else if (response.status === 404) {
            console.error("Такого дня нет в базе данных");
        }
        
    } catch (error) {
        console.error("Ошибка сети:", error);
    }
    console.log(days)
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
    const giftImage = document.getElementsByClassName("giftImage")[0];

    if (!giftAnimation || !giftImage) {
        return;
    }


    if (!days || days.length === 0) {
        return;
    }

    let dayValue = true;
    const targetDay = Number(day);

    for (let i = 0; i < days.length; i++) { 
        if (Number(days[i].id) === targetDay) { 
            dayValue = days[i].available; 
            break;
        } 
    }

    if (dayValue === true) {
        giftAnimation.classList.remove("hidden");
        giftImage.classList.add("hidden");
    } else {
        giftAnimation.classList.add("hidden");
        giftImage.classList.remove("hidden");
    }
}

async function openGift() {
    let responseData = days[selectedDay];

    /* Animations */
    if (responseData) {
        if (responseData.available) {

        } else if (!responseData.available) {
            const giftAnimation = document.getElementsByClassName('giftAnimation')[0];
            const giftImage = document.getElementsByClassName("giftImage")[0];
            if (giftAnimation) {
                const sources = giftAnimation.getElementsByTagName('source');
                giftAnimation.classList.remove("hidden")
                giftImage.classList.add("hidden")
                
                giftAnimation.loop = false;

                
                sources[0].src = "./animations/can't open.webm";
                sources[1].src = "./animations/can't open.mp4";

                giftAnimation.load();
                giftAnimation.play();

                giftAnimation.addEventListener('ended', function restoreOriginal() {
                    changeGiftAnimation(selectedDay);
                    giftImage.classList.remove("hidden")
                    giftAnimation.classList.add("hidden")
                });
            }
        }
    } else {
        return;
    } 
}



/* Right before user leaves */
document.addEventListener('visibilitychange', function() {
  if (document.visibilityState === 'hidden') {
    return
  }
});




/* 
---TODO LIST---
    0. Plan all gifts (Can do it anytime when I wanna)
1. Add storage system (already 50/50)
2. Add gift opens system
3. Add system of circle-videos
4. Make animations system (a function for showing animations) (already 50/50)
5. Make better UX
*/