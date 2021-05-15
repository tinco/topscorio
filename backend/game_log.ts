/*

Alright so the way we want to do this is:

 1. Users can create games
 2. Users can upload code for these games to run whenever a player of the game makes a move
 3. Players can play a game
 4. When a player plays a move in a game that move is ran through the code
 5. The results of the move ran through the code is stored.


 Ok so the API should go like this:

 - the game should have a startGame() that returns an initial game state object and a makeMove() function that takes
 a players move.
 - The gamestate has states for public, private and each player.
 - Public state should have standardized field for finished, or accepting moves state, and scores per player

*/

import {VM, VMScript} from 'vm2'
import fs from 'fs'

interface IGameState {
    game_over: boolean
    scores: {[key: string]: number}
}

interface IPlayer {
    id: string
}

interface IGame<State extends IGameState> {
    start(players: IPlayer[]): State
    move(state: State, player: IPlayer ): State
}

export default class GameLog {

    getGame(gameInfo: any): VM {
        const code = fs.readFileSync('./chess/chess.js', 'utf8')
        const script = new VMScript(code as unknown as string)
        console.log('compiling script...')
        script.compile()
        console.log('Script compiled.')
        const vm = new VM({
            timeout: 1000,
            eval: false,
            wasm: false,
            fixAsync: true,
            sandbox: {
                console: {
                    log: (msg: string) => console.log('VM2: ' + msg)
                }
            }
        })
        vm.run(script)
        return vm
    }

    startGame(gameInfo: any, players: IPlayer[]): IGameState {
        console.log('Making VM...')
        const vm = this.getGame(gameInfo)
        vm.setGlobal('players', players)

        const state = JSON.parse(vm.run(`
            const g = new Game()
            JSON.stringify(g.start(players))
        `))
        console.log("new state", state)
        return state
    }

    makeMove(gameInfo: any, gameState: IGameState, player: IPlayer, move: any): IGameState {
        console.log('Making VM...')
        const vm = this.getGame(gameInfo)
        vm.setGlobal('state', gameState)
        vm.setGlobal('player', player)
        vm.setGlobal('move', move)

        const state = JSON.parse(vm.run(`
            const g = new Game()
            JSON.stringify(g.move(state, player, move))
        `))
        console.log("new state", state)
        return state
    }

    foolsMate() {
        // const vm = this.getGame(null)
        let state: IGameState = {
            fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            colors: { A: 'w', B: 'b' },
            players: [
                { games: [] as any[], rating: 1200, id: 'A' },
                { games: [] as any[], rating: 1200, id: 'B' }
            ],
            game_over: false,
            scores: {}
        } as IGameState

        const playerOne = (state as any).players[0] as IPlayer
        const playerTwo = (state as any).players[1] as IPlayer

        state = this.makeMove(null, state, playerOne, 'f3')
        console.log("Move 1:", state)
        state = this.makeMove(null, state, playerTwo, 'e5')
        console.log("Move 2:", state)
        state = this.makeMove(null, state, playerOne, 'g4')
        console.log("Move 3:", state)
        state = this.makeMove(null, state, playerTwo, 'Qh4#')
        console.log("Move 4:", state)
    }
