const DBAdress = "https://aiwudhaiwufdja.loca.lt";
const bypassvalue = "v1";


//#region Cookies Functions
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
//#endregion

let days = [];

async function alldays() {
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
}

function get_all_days() {
    return days;
}

function updateDaysStatus() {
    const daysData = get_all_days(); 

    daysData.forEach(day => {
        const imgElement = document.querySelector(`img[data-id="${day.id}"]`);
        
        if (imgElement && !day.available) {
            imgElement.src = "./pngs/opened idle.png";
            imgElement.textContent = day.id + " день";
        }
    });

}

document.addEventListener('DOMContentLoaded', async () => {
    lottie.loadAnimation({
        container: document.getElementById('sticker-container'),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: './stickers/sticker.json'
    });

    await initializate();

    updateDaysStatus();
});

function fstMeet() {
    const FM = document.getElementsByClassName("FM")[0]
    if (getCookie("FMOG") || getCookie("FMOG") == false) {
        FM.remove()
    } else {
        FM.classList.remove("hidden")
    }
}

async function initializate() {
    await alldays()
    fstMeet()
}

function end_first_meet() {
    const FM = document.getElementsByClassName("FM")[0]
    FM.remove()
    setCookie("FMOG", false, 300)
}

function backPG() {
    window.location.href = '/';
}


document.getElementsByClassName("row")[0]
document.getElementsByClassName("row")[1]
document.getElementsByClassName("row")[2]
document.getElementsByClassName("row")[3]
document.getElementsByClassName("row")[4]