import './style/main.scss'

const log = (msg: string) => {
    document.body.insertAdjacentHTML('beforeend', `<p>${msg}</p>`)
}

log("Hello World")

const webSocket = new WebSocket('ws://' + window.location.host + '/auth')

webSocket.onopen = () => {
    log("Websocket connection opened")
}

webSocket.onmessage = (msg) => {
    log(`Received message: ${msg.data}`)
}

log('Built websocket')
