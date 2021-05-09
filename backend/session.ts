import SessionHandler from './session_handler.js'
import authStore from './authentication_store.js'
import cryptoRandomString from 'crypto-random-string'
import mailer from './mailer.js'

const makeToken = (length=10): string => cryptoRandomString({length})

export default class Session {
    handler: SessionHandler
    session: any

    constructor(handler: SessionHandler) {
        this.handler = handler
    }

    async start(data: any) {
        const sessionToken = makeToken(24)
        this.session = await authStore.newSession(sessionToken)
        this.send('started', { session: this.session })
    }

    async resume(data: any) {
        const sessionToken = data.sessionToken as string
        this.session = await authStore.resumeSession(sessionToken)
        this.send('resumed', { session: this.session })
    }

    async startAuth(data: any) {
        const result = this.startAuthentication(data.email)
        this.send('auth-started', result)
    }

    async finishAuth(data: any) {
        const userInfo = await authStore.finishAuthentication(data.token)
        this.session.email = userInfo.email
        this.save()
        this.send('auth-finished', { session: this.session, newUser: userInfo.newUser })
    }

    save() {
        return authStore.saveSession(this.session)
    }

    send(method: string, data: any) {
        return this.handler.send({ method, data })
    }

    async startAuthentication(email: string) : Promise<any> {
        // we start listening on a websocket for a confirmation
        // we start listening internally for a confirmation
        // then we send an e-mail
        // when the link in the e-mail is clicked
        const token = makeToken()

        const [redisResult, mailResult] = await Promise.all([
            authStore.startAuthentication(token, email),
            mailer.send({
            to: 'mail@tinco.nl',
            from: 'mail@tinco.nl', // Change to your verified sender
            subject: 'Log in at Topscorio',
            text: `Log in at Topscorio using the following link https://www.topscorio.com/auth?token=${token}`,
            html: `
                Log in at <strong>Topscorio</strong> using the following link:
                <a href="https://www.topscorio.com/auth?token=${token}">https://www.topscorio.com/auth?token=${token}</a>`,
        })])

        return {
            tokenResult: !!redisResult,
            mailResult
        }
    }
}
