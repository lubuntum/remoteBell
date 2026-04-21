import { API_URL, showNotification } from "./index.js"
import { getModalHtml } from "./modal/modal.js"

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
                        <p><b>${event.time} - ${event.filepath || event.file}</b></p>
                        <i class="fa-solid fa-trash" data-day="${day.day}" data-event-time="${event.time}"></i>
                    </div>`;
        }).join(''); 
        
        return `<div class="day">
                    <h3>${day.day}</h3>
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
            console.log(`Add for day: ${day}`)
            await document.body.insertAdjacentHTML('beforeend', await getModalHtml(day))
            
        })
    })
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