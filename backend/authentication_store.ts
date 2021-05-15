import Redis from "ioredis"
import RedisJSON from "ioredis-json"

import dotenv from "dotenv"
dotenv.config()

const sessionStore = new Redis(process.env.SESSION_REDIS)
const usersStore = new RedisJSON(process.env.USERS_REDIS)

sessionStore.on("error", (error) => {
    console.error("SESSION_REDIS_ERROR:", error)
})

usersStore.on("error", (error) => {
    console.error("USERS_REDIS_ERROR:", error)
})

const sessionKey = (sessionToken: string) => `session-${sessionToken}`

class AuthStore {
    async newSession(sessionToken: string) {
        const session = { sessionToken }
        await sessionStore.setex(sessionKey(sessionToken), 60 * 60 * 72,  JSON.stringify(session))
        return session
    }

    async resumeSession(sessionToken: string) {
        if (!sessionToken) {
            throw new Error("SessionToken null")
        }
        const session = await sessionStore.get(sessionKey(sessionToken))
        if (!session) {
            throw new Error("Invalid or expired session")
        }
        return JSON.parse(session)
    }

    async saveSession(session: any) {
        return sessionStore.setex(sessionKey(session.sessionToken), 60*60*24*31, JSON.stringify(session))
    }

    async startAuthentication(token: string, email: string) {
        return sessionStore.setex(token, 600, JSON.stringify({ email }))
    }

    async finishAuthentication(token: string) {
        const authResult = await sessionStore.get(token).then((r) => JSON.parse(r))
        let userInfo = await usersStore.get(authResult.email, '.')
        let newUser = false

        if (!userInfo) {
            userInfo = {
                newUser: true,
                id: token,
                email: authResult.email
            }

            await usersStore.set(authResult.email, '.', userInfo)
        } else {
           newUser = true
        }

        return Object.assign(userInfo, { newUser })
    }
}

export default new AuthStore()
