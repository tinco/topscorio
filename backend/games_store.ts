import Redis from "ioredis"
import RedisJSON from "ioredis-json"
import EventEmitter from "events"

import dotenv from "dotenv"
dotenv.config()

const gameLogsStore = new RedisJSON(process.env.GAME_LOGS_REDIS)
const gameLogsPublisher = new Redis(process.env.GAME_LOGS_REDIS)
const gameLogsSubscriber = new Redis(process.env.GAME_LOGS_REDIS)
const gamesStore = new RedisJSON(process.env.GAMES_REDIS)
const gamesPublisher= new Redis(process.env.GAMES_REDIS)
const gamesSubscriber = new Redis(process.env.GAMES_REDIS)

gameLogsStore.on("error", (error) => {
    console.error("GAME_LOGS_STORE_ERROR:", error)
})

gameLogsSubscriber.on("error", (error) => {
    console.error("GAME_LOGS_SUBSCRIBER_ERROR:", error)
})

gamesStore.on("error", (error) => {
    console.error("GAMES_STORE_ERROR:", error)
})

gamesSubscriber.on("error", (error) => {
    console.error("GAMES_SUBSCRIBER_ERROR:", error)
})

const gameKey = (gameId: string) => `game-${gameId}`
const stateKey = (gameId: string) => `state-${gameId}`

class GamesStore extends EventEmitter {
    listenerCountsPerChannel: Map<string, number> = new Map()

    async initialize() {
        const allGames = await gamesStore.get('all-games', '.')
        if (!allGames) {
            console.log('Initializing all-games')
            await gamesStore.set('all-games', '.', { newest: []})
        }

        gamesSubscriber.on('message', (channel, message) => {
            this.emit(`games-${channel}`, JSON.parse(message))
        })

        gameLogsSubscriber.on('message', (channel, message) => {
            console.log('emitting game_log', channel, message)
            this.emit(`game_logs-${channel}`, JSON.parse(message))
        })

        gamesSubscriber.subscribe('newest')
        gameLogsSubscriber.subscribe('open')
    }

    on(nameS: string | symbol, handler: EventListener): this {
        const name = nameS.toString()
        const [topic, channel] = name.split('-')
        if (!this.listenerCountsPerChannel.has(name) || this.listenerCountsPerChannel.get(name) === 0) {
            this.listenerCountsPerChannel.set(channel, 1)
            switch(topic) {
                case 'games':
                    gamesSubscriber.subscribe(channel).catch((err) => {
                        console.log("ERROR: Can't subscribe to channel: " + err.message)
                    })
                    break
                case 'game_logs':
                    console.log('subscribing to gamelogs channel', channel)
                    gameLogsSubscriber.subscribe(channel).catch((err) => {
                        console.log("ERROR: Can't subscribe to channel: " + err.message)
                    })
                    break
                default:
                    throw new Error("Unknown topic " + topic)
            }
        } else {
            const count = this.listenerCountsPerChannel.get(channel)
            this.listenerCountsPerChannel.set(channel, count + 1)
        }
        return super.on(nameS, handler)
    }

    async addGame(user: string, gameId: string, gameInfo: any) {
        gameInfo.id = gameId
        gameInfo.publisher = user
        await gamesStore.set(gameKey(gameId),".", gameInfo)
        const newCount = await gamesStore.arrappend('all-games', '.newest', gameInfo)
        const newCountAfter = await gamesStore.arrtrim('all-games', '.newest', newCount - 50, newCount + 10000)
        gamesPublisher.publish('newest', JSON.stringify(gameInfo))
        console.log('added game, new count is:', newCount, newCountAfter)
        return gameInfo
    }

    async getGameInfo(id: string): Promise<any> {
        return gamesStore.get(gameKey(id),'.')
    }

    async getNewestGames(): Promise<any[]> {
        return gamesStore.get('all-games', '.newest')
    }

    async saveGameState(id: string, state: any): Promise<void> {
        await gameLogsStore.set(stateKey(id), ".", state)
        if (!state.started) {
            gameLogsPublisher.publish('open', JSON.stringify(state))
        }
        console.log('publishing state to gameLogs', id)
        gameLogsPublisher.publish(id, JSON.stringify(state))
    }

    async getGameState(id: string): Promise<any> {
        return gameLogsStore.get(stateKey(id), ".")
    }
}

const store = new GamesStore()
store.initialize()
export default store
