import SessionHandler from './session_handler.js'
import authStore from './authentication_store.js'
import cryptoRandomString from 'crypto-random-string'
import mailer from './mailer.js'
import gamesStore from './games_store.js'
import gameLog from './game_log.js'

const makeToken = (length=10): string => cryptoRandomString({length})

export default class Session {
    handler: SessionHandler
    session: any

    constructor(handler: SessionHandler) {
        this.handler = handler

        gamesStore.on('games-newest', (game) => this.send('new-game', game))
    }

    get userInfo() {
        return this.session.userInfo
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
        this.session.userInfo = userInfo
        this.save()
        this.send('auth-finished', { session: this.session })
    }

    async addGame(gameInfo: any) {
        if (this.userInfo) {
            const gameId = makeToken(24)
            const result = await gamesStore.addGame(this.userInfo.email, gameId, gameInfo)
            this.send('added-game', { gameInfo: result })
        } else {
            this.send('error', { message: 'Not authenticated.'})
        }
    }

    async getNewestGames(_options: any) {
        const newestGames = await gamesStore.getNewestGames()
        this.send('newest-games', { games: newestGames })
    }

    async createGameLog(gameId: string) {
        if (!this.userInfo) {
            throw new Error("Only logged in users can play logged games.")
        }

        const state = await gameLog.createGame(gameId, this.userInfo)

        this.send('created-game', state)
        this.followGameLog(state.gameLogId)
    }

    followGameLog(id: string) {
        gamesStore.on(`game_log-${id}`, (state: any) => {
            this.send('game-log', state)
        })
    }

    async joinGameLog(gameId: string) {
        if (!this.userInfo) {
            throw new Error("Only logged in users can play logged games.")
        }

        await gameLog.joinGame(gameId, { id: this.userInfo })
        this.followGameLog(gameId)
    }

    async startGameLog(id: string) {
        if (!this.userInfo) {
            throw new Error("Only logged in users can play logged games.")
        }

        gameLog.startGame(id, this.userInfo)
    }

    async makeMove(gameLogId: string, move: any) {
        if (!this.userInfo) {
            throw new Error("Only logged in users can play logged games.")
        }
        gameLog.makeMove(gameLogId, this.userInfo, move)
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
