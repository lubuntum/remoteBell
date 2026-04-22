export const API_URL = 'http://192.168.155.75:8000'
let currentlySelected = null
const audioClick =  async function() {
    const filename = this.dataset.filename
    if (currentlySelected && currentlySelected !== this) {
        currentlySelected.classList.remove('active')
        currentlySelected.style.backgroundColor = ''
        currentlySelected.style.transform = ''
        currentlySelected.style.borderLeft = ''
    }
    if (currentlySelected === this) {
        this.classList.remove('active')
        this.style.backgroundColor = ''
        this.style.transform = ''
        currentlySelected = null
        await stopPlayOnServer()
        return
    }
    this.classList.add('active')
    this.style.backgroundColor = '#e3f2fd'
    this.style.borderLeft = '4px solid #667eea'
    currentlySelected = this
    playOnServer(filename)
}
//global funcion for inline use
window.alarmTrigger = async function(clickedItem) {
    if (currentlySelected === clickedItem) {
        await stopPlayOnServer()
        currentlySelected = null
        return
    }
    currentlySelected = clickedItem
    playOnServer(clickedItem.dataset.filename)
}
export const getAudioFilesHTML = async() => {
    try {
        const response = await fetch(`${API_URL}/api/audio-files`)
        const data = await response.json()

        if (!data.files || data.files.length === 0) {
            soundsList.innerHTML = "<div>Нет аудо файлов</div>"
        }
        const soundsHTML = data.files.map(file => {
            const displayName = file.replace(".mp3", '').replace(/_/g, ' ');
            return `
                <div class="sound" data-name="${displayName}" data-filename="${file}">
                    <div class="sound-info">
                        <span class="sound-title">${displayName}</span>
                    </div>
                    <audio controls src="${API_URL}/audio/${file}"></audio>
                </div>
            `;
        }).join('');
        return `<div class="sounds-list"> ${soundsHTML} </div>`
        
    } catch(err) {
        console.error(err)
        document.getElementById("soundsList").innerHTML = `<div class="error"> Ошибка при загрузке песен ${err} </div>`
    }
}

const stopPlayOnServer = async () => {
    try {
        const response = await fetch(`${API_URL}/api/stop-audio`, {
            method: "POST"
        })
        showNotification("Аудио остановлено", "info") 
    } catch (err) {
        showNotification("Возникла ошибка при остановке", "error") 
    }
}
const playOnServer = async (filename) => {
    try {
        const response = await fetch(`${API_URL}/api/play-audio`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({filename: filename})
        })
        const data = await response.json()
        if (!response.ok) {
            console.error("Error", data.detail)
            showNotification(`Возникла ошибка: ${data.detail}`, 'error')
            return
        }
        console.log("Playing", data.filename)
        showNotification(`Сейчас играет: ${data.filename}`, 'success')
    } catch(err) {
        showNotification(`Ошибка при соденинении с сервером:`, 'error')
    }
}
export const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div')
    notification.className = `notification ${type}`
    notification.textContent = message
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 10px 20px;
        background: ${type === 'success' ? '#4caf50' : type === 'error' ? "#f44336" : "#2196f3"};
        color: white;
        border-radius: 5px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        opacity: 0.8
    `
    document.body.appendChild(notification)
    setTimeout(() => {
        notification.remove()
    }, 3000)
}
//document.addEventListener("DOMContentLoaded", loadAudioFiles)