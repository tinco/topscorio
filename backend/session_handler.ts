import ws from "ws"
import Session from "./session.js"

export default class SessionHandler {
    connection: ws
    session: Session

    constructor(connection: ws) {
        this.connection = connection
        this.session = new Session(this)
    }

    async handleMessage(rawMessage: string) {
        try {
            const message = JSON.parse(rawMessage)
            switch (message.method) {
                case 'start': await this.session.start(message.data); break
                case 'resume': await this.session.resume(message.data); break
                case 'start-auth': await this.session.startAuth(message.data); break
                case 'finish-auth': await this.session.finishAuth(message.data); break
                case 'add-game': await this.session.addGame(message.data); break
                case 'get-newest-games': await this.session.getNewestGames(message.data); break
                case 'create-game': await this.session.createGameLog(message.data); break
                case 'join-game': await this.session.joinGameLog(message.data); break
                case 'start-game': await this.session.startGameLog(message.data); break
                case 'make-move': await this.session.makeMove(message.data); break
                default: throw new Error(`Unknown command ${message.method}`)
            }
        } catch (e) {
            this.sendError(e)
            this.stop()
        }
    }

    stop() {
        this.connection.close()
    }

    send(message: any) {
        this.connection.send(JSON.stringify(message))
    }

    sendError(e: Error) {
        // console.error(`Error: ${e.message}, ${e.name}\n${e.stack}` )
        this.send({ method: "error", data: { message: e.message, name: e.name, stack: e.stack}})
    }
}