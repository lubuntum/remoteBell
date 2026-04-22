import { getAudioFilesHTML } from "../index.js"

window.onclick = function(event) {
    const modal = document.getElementById("modal")
    if (event.target === modal) {
        document.removeChild(modal)
    }
}

export const getModalHtml = async (day) => {
    return `
    <div class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${day}</h3>
                </div>
                <div class="modal-body">
                    <form id="add-schedule">
                        <div class="flex-col"> 
                            <input id="time" type="text" placeholder="ЧЧ:ММ">
                            <input id="duration" type="number" placeholder="Длительность сек.">
                        </div>
                        ${await getAudioFilesHTML()}
                        <button type="submit" id="submit-btn">Добавить</button>
                    </form>
                </div>
            </div>
        </div>`
}