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
        path: 'sticker.json'
    });

    checkFirstMeet();
});

function continue_gift() {
    const container_firstmeet = document.querySelector(".container_firstmeet");
    const sticker = document.getElementById("sticker-container");

    if (sticker) {
        sticker.classList.add("move-sticker");
    }

    if (container_firstmeet) {
        container_firstmeet.remove();
    }

    setCookie("firstmeet", "true", 365);
}

function checkFirstMeet() {
    if (getCookie("firstmeet") === "true") {
        const container_firstmeet = document.querySelector(".container_firstmeet");
        const sticker = document.getElementById("sticker-container");

        if (container_firstmeet) {
            container_firstmeet.remove();
        }

        if (sticker) {
            sticker.style.transition = "none";
            sticker.classList.add("move-sticker");
        }
    }
}

function restartAnimations() {
    deleteCookie("firstmeet")

    location.reload();

}