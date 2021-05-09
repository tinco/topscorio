import Session from './session'

class Authentication {
    session: Session

    constructor(session: Session) {
        this.session = session 
    }

    get element() {
        return document.getElementById('authentication')
    }

    render() {
        document.body.insertAdjacentHTML('beforeend',`
            <section id="authentication-section">
                <h1>Authentication</h1>
                <div id="authentication"></div>
                <p>Authenticate</p>
                <input type="text" id="email" />
                <button id="authenticate-button">Start authenticate</button>
                <input type="text" id="auth-token" />
                <button id="finish-authenticate-button">Finish authenticate</button>
                <button id="clear-button">Clear session</button>
            </section>
        `)
        const authenticateButton = document.getElementById('authenticate-button')
        const finishAuthenticateButton = document.getElementById('finish-authenticate-button')
        authenticateButton.onclick = () => this.startAuthentication()
        finishAuthenticateButton.onclick = () => this.finishAuthentication()
        document.getElementById('clear-button').onclick = () => this.session.clearSession()
    }

    startAuthentication() {
        const email = (document.getElementById('email') as HTMLInputElement).value
        this.session.startAuthentication(email)
    }

    finishAuthentication() {
        const token = (document.getElementById('auth-token') as HTMLInputElement).value
        this.session.finishAuthentication(token)
    }
}

export default Authentication