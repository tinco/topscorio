import Session from './session'

class Authentication {
    session: Session

    constructor(session: Session, callback: () => void) {
        this.session = session 
        this.session.on('auth-finished', () => {
            this.destroy()
            callback()
        })
    }

    get element() {
        return document.getElementById('authentication-overlay')
    }

    destroy() {
        this.element.remove()
    }

    render() {
        document.body.insertAdjacentHTML('beforeend',`
            <div id="authentication-overlay" class="form-signin">
                <div class="form-signin">
                    <h1 class="h3 mb-3 fw-normal">Please sign in</h1>

                    <div class="form-floating">
                    <input type="email" class="form-control" id="authenticate-email" placeholder="name@example.com">
                    <label for="floatingInput">Email address</label>
                    </div>

                    <button class="w-100 btn btn-lg btn-primary" id="authenticate-button">Sign in</button>
                </div>
            </div>
        `)
        const authenticateButton = document.getElementById('authenticate-button')
        authenticateButton.onclick = () => {
            const email = (document.getElementById('authenticate-email') as HTMLInputElement).value
            authenticateButton.classList.add('disabled')
            authenticateButton.innerHTML = "Please check your e-mail to log in"
            this.session.startAuthentication(email)
        }
    }
}

export default Authentication