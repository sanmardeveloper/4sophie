const DBAdress = "https://aiwudhaiwufdja.loca.lt";
const bypassvalue = "v1";


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

            const loadingScreen = document.getElementsByClassName('hover')[0]
            loadingScreen.remove()
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
        }
    });

}

document.addEventListener('DOMContentLoaded', () => {
    lottie.loadAnimation({
        container: document.getElementById('sticker-container'),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: './stickers/sticker.json'
    });

    initializate()
    updateDaysStatus
});

async function initializate() {
    await alldays()
}


document.getElementsByClassName("row")[0]
document.getElementsByClassName("row")[1]
document.getElementsByClassName("row")[2]
document.getElementsByClassName("row")[3]
document.getElementsByClassName("row")[4]