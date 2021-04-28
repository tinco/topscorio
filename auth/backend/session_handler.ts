import ws from "ws"
import Session from "./session.js"

export default class SessionHandler {
    connection: ws
    session: Session

    constructor(connection: ws) {
        this.connection = connection
        this.session = new Session(this)
    }

    handleMessage(rawMessage: string) {
        try {
            const message = JSON.parse(rawMessage)
            switch (message.method) {
                case 'start': this.session.start(message.data); break
                case 'resume': this.session.resume(message.data); break
                default: throw new Error(`Unkown command ${message.method}`)
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
        console.error(`Error: ${e.message}, ${e.name}\n${e.stack}` )
        this.send({ method: "error", data: { message: e.message, name: e.name, stack: e.stack}})
    }
}