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

    send(method: string, data: any) {
        return this.handler.send({ method, data })
    }

    async handleAuthReq(email: string) : Promise<any> {
        // we start listening on a websocket for a confirmation
        // we start listening internally for a confirmation
        // then we send an e-mail
        // when the link in the e-mail is clicked
        const token = makeToken()

        const redisResult = !!authStore.startEmailAuth(token, email)

        const mailResult = await mailer.send({
            to: 'mail@tinco.nl',
            from: 'mail@tinco.nl', // Change to your verified sender
            subject: 'Log in at Topscorio',
            text: 'and easy to do anywhere, even with Node.js',
            html: '<strong>and easy to do anywhere, even with Node.js</strong>',
        })

        return {
            tokenResult: redisResult,
            mailResult
        }
    }
}
