import Session from './session'
import { Chessground } from 'chessground'

class Game {
    session: Session
    id: string
    state: any = {}

    constructor(session: Session) {
        this.session = session

        this.session.on('game-log', (state: any) => this.nextState(state))
        this.session.on('open-game', (data: any) => {
            this.openedGame(data)
        })

        //@ts-ignore
        window['game'] = this
    }

    get element(): HTMLElement {
        return document.getElementById('game')
    }

    render() {
        document.body.insertAdjacentHTML('beforeend',`
        <div id="game">
            <button id="start-game">Start</button>
        </div>
        `)
        const startButton = document.getElementById('start-game')
        startButton.onclick = () => this.startGame()
    }

    renderGame() {
        this.element.innerHTML = `
            <p id="game-color"></p>
            <p id="game-fen"></p>
            <label for="game-move">Insert move</label>
            <input type="text" id="game-move" />
            <button id="move">Move</button>
            <div id="board" class="merida"></div>
        `
        document.getElementById('game-color').innerHTML = JSON.stringify(this.state.colors)
        document.getElementById('game-fen').innerHTML = JSON.stringify(this.state.fen)
        document.getElementById('move').onclick = () => {
            const move = (document.getElementById('game-move') as HTMLInputElement).value
            this.session.makeMove(this.id, move)
        }

        const color = this.state.colors[this.session.userInfo.id] === 'w' ? 'white' : 'black'
        const cg = Chessground(document.getElementById('board'), {
            fen: this.state.fen,
            orientation: color,
            movable: {
                color,
                free: false
            },
            draggable: {
                showGhost: true
            }
        })
    }

    nextState(state: any) {
        if (state.gameLogId !== this.id) { return }
        this.state = state
        console.log('next state', state)
        if (this.state.started) {
            this.renderGame()
        }
    }

    startGame() {
        if (this.id) {
            this.session.startGame(this.id)
        } else {
            console.log('Not in a game lobby')
        }
    }

    openedGame(state: any) {
        console.log('opened game, testing membership')
        if (state.players.find((p: any) => p.id === this.session.userInfo.id)) {
            console.log('opened game')
            this.id = state.gameLogId
            this.nextState(state)
        } else {
            console.log('was not a member', state.players, this.session.userInfo)
        }
    }
}

export default Game