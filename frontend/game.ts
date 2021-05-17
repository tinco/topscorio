import Session from './session'
import { Chessground } from 'chessground'

class Game {
    session: Session
    id: string
    state: any = {}
    openGames: any[] = []

    constructor(session: Session) {
        this.session = session

        this.session.on('game-log', (state: any) => this.nextState(state))
        this.session.on('open-game', (data: any) => {
            this.openGames.push(data)
            this.openedGame(data)
        })

        //@ts-ignore
        window['game'] = this
    }

    get element(): HTMLElement {
        return document.getElementById('game')
    }

    updatePlayerInfo() {
        document.getElementById('game-player-email').innerHTML = this.session.userInfo.email
        document.getElementById('game-player-rating-badge').innerHTML = this.session.userInfo?.games?.chess?.rating || 1200
    }

    render() {
        const joinButton = document.getElementById('game-join-game-button')
        joinButton.onclick = () => this.playGame()

        const startButton = document.getElementById('game-lobby-start-button')
        startButton.onclick = () => this.startGame()

        this.updatePlayerInfo()
    }

    playGame() {
        let game = this.openGames.filter((g) => g.gameId === 'chess')[0]
        if (game) {
            console.log('joining game', game)
            this.session.joinGame(game.gameLogId)
        } else {
            this.session.createGame('chess')
        }
    }

    renderGame() {
        const color = this.state.colors[this.session.userInfo.id] === 'w' ? 'white' : 'black'
        const turnColor = this.state.turn_color === 'w' ? 'white' : 'black'

        document.getElementById('game-color').innerHTML = color
        document.getElementById('game-turn').innerHTML = turnColor

        console.log('My color is: ', color)
        console.log('Turn is: ', turnColor, this.state.turn_color)

        const cg = Chessground(document.getElementById('game-board'), {
            fen: this.state.fen,
            orientation: color,
            turnColor,
            movable: {
                color,
                free: true,
                events: {
                    after: (orig, dest, meta) => this.makeMove(orig, dest, meta)
                }
            },
            draggable: {
                showGhost: true
            },
        })
    }

    makeMove(orig: string, dest: string, meta: any) {
        console.log('Moving', orig, dest, meta)
        this.session.makeMove(this.id, { from: orig, to: dest})
    }

    nextState(state: any) {
        if (state.gameLogId !== this.id) { return }
        this.state = state

        const player = this.state.players.find((p: any) => p.id === this.session.userInfo.id)
        const opponent = this.state.players.find((p: any) => p.id !== this.session.userInfo.id)

        document.querySelectorAll('#game-states > *').forEach((e) => e.classList.add('hidden'))
        if (this.state.game_over) {
            document.getElementById('game-finished').classList.remove('hidden')
            this.session.userInfo['games'] = { chess: player }
            this.updatePlayerInfo()
            document.getElementById('game-result-rating').innerHTML = this.session.userInfo.games.chess.rating
        } else if (this.state.started) {
            document.getElementById('game-play').classList.remove('hidden')
            this.renderGame()
        } else {
            document.getElementById('game-lobby').classList.remove('hidden')
            if (opponent) {
                document.getElementById('game-waiting').classList.add('hidden')
                document.getElementById('game-in-lobby').classList.remove('hidden')
                document.getElementById('game-lobby-opponent-badge').innerHTML = opponent.email
            }
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
        if (state.error) {
            // redo if erroneous move
            this.nextState(this.state)
        }
        if (state.players.find((p: any) => p.id === this.session.userInfo.id)) {
            console.log('joined game')
            this.id = state.gameLogId
            this.nextState(state)
        } else {
            console.log('was not a member', state.players, this.session.userInfo)
        }
    }
}

export default Game