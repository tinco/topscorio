import './style/main.scss'

document.body.insertAdjacentHTML('beforeend', `<section id="log-section"><div id="log"></div></section>`)
const logElement = document.getElementById('log')

const log = (msg: string) => {
    logElement.insertAdjacentHTML('beforeend', `<p>${msg}</p>`)
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

class Authentication {
    get element() {
        return document.getElementById('authentication')
    }

    render() {
        document.body.insertAdjacentHTML('beforeend',`
            <section id="authentication-section">
                <h1>Authentication</h1>
                <button id="start-button">Start</button>
                <input type="text" id="resume-token" />
                <button id="resume-button">Resume</button>
                <div id="authentication"></div>
                <p>Authenticate</p>
                <input type="text" id="email" />
                <button id="authenticate-button">Start authenticate</button>
                <input type="text" id="auth-token" />
                <button id="finish-authenticate-button">Finish authenticate</button>
            </section>
        `)
        const startButton = document.getElementById('start-button')
        const resumeButton = document.getElementById('resume-button')
        const authenticateButton = document.getElementById('authenticate-button')
        const finishAuthenticateButton = document.getElementById('finish-authenticate-button')
        startButton.onclick = () => this.startSession()
        resumeButton.onclick = () => this.resumeSession()
        authenticateButton.onclick = () => this.startAuthentication()
        finishAuthenticateButton.onclick = () => this.finishAuthentication()
    }

    startSession() {
        webSocket.send(JSON.stringify({method: 'start', data: {}}))
    }

    resumeSession() {
        const token = (document.getElementById('resume-token') as HTMLInputElement).value
        webSocket.send(JSON.stringify({method: 'resume', data: { sessionToken: token} }))
    }

    startAuthentication() {
        const email = (document.getElementById('email') as HTMLInputElement).value
        webSocket.send(JSON.stringify({method: 'start-auth', data: { email }}))
    }

    finishAuthentication() {
        const token = (document.getElementById('auth-token') as HTMLInputElement).value
        webSocket.send(JSON.stringify({method: 'finish-auth', data: { token }}))
    }
}

const authentication = new Authentication()
authentication.render()
