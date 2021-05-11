import Redis from "ioredis"
import RedisJSON from "ioredis-json"

import dotenv from "dotenv"
dotenv.config()

const logsStore = new RedisJSON(process.env.GAME_LOGS_REDIS)
const gamesStore = new RedisJSON(process.env.GAMES_REDIS)

logsStore.on("error", (error) => {
    console.error("SESSION_REDIS_ERROR:", error)
})

gamesStore.on("error", (error) => {
    console.error("USERS_REDIS_ERROR:", error)
})

const gameKey = (gameId: string) => `game-${gameId}`

class GamesStore {
    async initialize() {
        const allGames = await gamesStore.get('all-games', '.')
        if (!allGames) {
            console.log('Initializing all-games')
            await gamesStore.set('all-games', '.', { newest: []})
        }
    }

    async addGame(gameId: string, gameInfo: any) {
        gameInfo.id = gameId
        await gamesStore.set(gameKey(gameId),".", gameInfo)
        const newCount = await gamesStore.arrappend('all-games', '.newest', [gameInfo])
        const newCountAfter = await gamesStore.arrtrim('all-games', '.newest', newCount - 50, newCount + 10000)
        console.log('added game, new count is:', newCount, newCountAfter)
        return gameInfo
    }

    async getNewestGames(gameId: string, gameInfo: any): Promise<any[]> {
        gameInfo.id = gameId
        return gamesStore.get('all-games', '.newest')
    }
}

export default new GamesStore()
