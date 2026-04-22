import { API_URL, showNotification } from "./index.js"
import { getModalHtml } from "./modal/modal.js"
import { isDigit, validateTime } from "./utility.js"

const loadSchedules = async () => {
    try {
        const response = await fetch(`${API_URL}/api/schedules`)
        const data = await response.json()
        return data
    } catch(err) {
        console.error(err)
    }
}
const generateSchedules = (schedules) => {
    const daysListDiv = document.getElementById("days-list")
    if (!schedules || schedules.length === 0) {
        daysListDiv.innerHTML = "<div>Расписание не найдено X(</div>"
        return
    }
    const daysHTML = schedules.map(day => {

        const eventsHTML = day.events.map(event => {
            return `<div class="schedule">
                        <p><b>Время ${event.time}, ${event.filepath.split("/").pop()}, ${event?.duration} сек.</b></p>
                        <i class="fa-solid fa-trash" data-day="${day.day}" data-event-time="${event.time}"></i>
                    </div>`;
        }).join(''); 
        
        return `<div class="day">
                    <h3>${day.dayRu}</h3>
                    <div class="schedules-list">
                        ${eventsHTML}
                    </div>
                    <button class="add-btn" data-day="${day.day}">Добавить</button>
                </div>`;
    }).join(''); 
    daysListDiv.innerHTML = daysHTML
    document.querySelectorAll(".fa-trash").forEach(icon => {
        icon.addEventListener("click", e => {
            e.stopPropagation()
            const day = icon.dataset.day
            const eventTime = icon.dataset.eventTime
            console.log("Delete: ", day, eventTime)
            deleteScheduleItem(day, eventTime)
        })
    })
    
    document.querySelectorAll(".add-btn").forEach(btn => {
        btn.addEventListener("click", async (e)=> {
            const day = btn.dataset.day
            await document.body.insertAdjacentHTML('beforeend', await getModalHtml(day))
            const modal = document.querySelector(".modal")
            console.log(modal)
            modal.querySelectorAll(".sound").forEach(item => {
                item.addEventListener("click", async (e) => {
                    e.stopPropagation()
                    console.log(`${item.dataset.filename}`)
                    modal.querySelectorAll(".sound").forEach(s => s.classList.remove("active"))
                    item.classList.add("active")
                })
            })
            modal.addEventListener('click', e => {
                if (e.target === modal)
                    modal.remove()
            })
            const submitBtn = modal.querySelector('button[type="submit"]');
            submitBtn.addEventListener("click", async (e) => {
                e.preventDefault(); // This MUST be first
                e.stopPropagation(); // Add this too
                
                const activeSound = modal.querySelector(".sound.active");
                if (!activeSound) {
                    showNotification("Выберите аудиофайл", "error")
                    return false
                }
                const filename = activeSound.dataset.filename;
                const time = modal.querySelector("#time").value
                const duration = modal.querySelector("#duration").value
                if (!filename || !time || !duration) {
                    showNotification("Заполните все поля", "error")
                    return
                }
                if (!validateTime(time)) {
                    showNotification("Введите время в правильном формате", "error")
                    return
                }
                if (!isDigit(duration)) {
                    showNotification("Длительность должна быть числом", "error")
                    return
                }
                await addScheduleItem(day, time, duration, filename)
                modal.remove();
                renderSchedules()
                return false; // Extra prevention
            });
        })
    })

    
}
const addScheduleItem = async(day, time, duration, filepath) => {
    try {
        const response = await fetch(`${API_URL}/api/schedules/days/events`, {
            method: "POST", 
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                day: day,
                time: time,
                duration: duration,
                filepath: filepath
            })
        })
        showNotification(`Добавлен звонок на ${day} - ${time}`)
    } catch(err) {
        console.error("Ошибка при отправке", err)
        showNotification("Возникла ошибка при отправке", "error")
    }
}
const deleteScheduleItem = async (day, time) => {
    console.log(`Deleting ${time} from ${day}`)
    const params = new URLSearchParams({
        day: day,
        time: time
    })
    const response = await fetch(`/api/schedules/days/events?${params.toString()}`, {
        method: "DELETE"
    })
    showNotification(`Звонок на ${day} - ${time} удален`)
    renderSchedules()

}
const renderSchedules = async () => {
    const data = await loadSchedules()
    generateSchedules(data.schedules)
}

document.addEventListener("DOMContentLoaded", renderSchedules)