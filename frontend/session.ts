import log from './log'

const secondsAgo = (n: number): Date => {
    const d = new Date()
    d.setSeconds(d.getSeconds() - n)
    return d
}

class Session {
    socket: WebSocket
    lastCloseTime = new Date()
    backOffMillis = 1000
    session: any = {}
    listeners: Map<string, ((data: any) => void)[]> = new Map() 

    constructor() {
        this.start()
    }

    get userInfo() {
        return this.session.userInfo
    }

    onopen() {
        log("Websocket connection opened")
        
        const sessionToken = localStorage.getItem('SessionToken')
        if (sessionToken) {
            this.resumeSession(sessionToken)
        } else {
            this.startSession()
        }
    }

    onresumed(data: any) {
        this.session = data.session
    }

    onstarted(data: any) {
        this.session = data.session
        localStorage.setItem('SessionToken', this.session.sessionToken)
    }

    clearSession() {
        localStorage.removeItem('SessionToken')
    }

    onmessage(msg: any) {
        log(`Received message: ${msg.method}(${JSON.stringify(msg.data)})`)
        switch(msg.method) {
            case 'resumed': this.onresumed(msg.data); break
            case 'started': this.onstarted(msg.data); break
            case 'auth-finished': this.onAuthFinished(msg.data); break
            default: this.received(msg.method, msg.data); break
        }
    }

    on(method: string, listener: (data: any) => void) {
        if(!this.listeners.has(method)) {
            this.listeners.set(method, [])
        }  
        this.listeners.get(method).push(listener)
    }

    onAuthFinished(data: any) {
        this.session = data.session
    }

    received(method: string, data:any) {
        this.listeners.get(method)?.forEach(l => l(data))
    }

    start() {
        if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
            return
        }
        log('Starting websocket..')

        this.lastCloseTime = new Date()
        this.socket = new WebSocket('ws://' + window.location.host + '/auth')

        this.socket.onopen = () => this.onopen()

        this.socket.onmessage = (msg) => {
            this.onmessage(JSON.parse(msg.data))
        }

        this.socket.onclose = (msg) => {
            log(`Socket closed ${msg}`)
            // if (secondsAgo(1) > this.lastCloseTime) {
            setTimeout(() => { this.start() }, this.backOffMillis)
            // } else {
            //     this.start()
            // }
        }

        this.socket.onerror = (msg) => {
            log(`Socket error: ${msg}`)
        }
    }

    send(method: string, data: any) {
        this.socket.send(JSON.stringify({ method, data }))
    }

    startSession() {
        this.send('start',{})
    }

    resumeSession(token: string) {
        this.send('resume', { sessionToken: token})
    }

    startAuthentication(email: string) {
        this.send('start-auth', { email })
    }

    finishAuthentication(token: string) {
        this.send('finish-auth', { token })
    }

    addGame(gameInfo: any) {
        this.send('add-game', gameInfo)
    }

    getNewestGames() {
        this.send('get-newest-games',{})
    }

    createGame(gameId: string) {
        this.send('create-game', gameId)
    }

    joinGame(gameId: string) {
        this.send('join-game', gameId)
    }

    startGame(gameId: string) {
        this.send('start-game', gameId)
    }

    makeMove(gameId: string, move: any) {
        this.send('make-move', { gameLogId: gameId, move })
    }
}

export default Session