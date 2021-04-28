import Redis from "ioredis"

const authStore = new Redis(process.env.AUTH_REDIS)

authStore.config('SET', 'stop-writes-on-bgsave-error', "no")

authStore.on("error", (error) => {
    console.error("REDIS_ERROR:", error)
})

const sessionKey = (sessionToken: string) => `session-${sessionToken}`

class AuthStore {
    async newSession(sessionToken: string) {
        const session = { sessionToken }
        await authStore.setex(sessionKey(sessionToken), 60 * 60 * 72,  JSON.stringify(session))
        return session
    }

    async resumeSession(sessionToken: string) {
        const session = await authStore.get(sessionKey(sessionToken))
        return JSON.parse(session)
    }

    async startEmailAuth(token: string, email: string) {
        return authStore.setex(token, 600, JSON.stringify({ email }))
    }
}

export default new AuthStore()
