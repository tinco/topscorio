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
    startGame(gameId: string, players: IPlayer[]) {
        const code = fs.readFileSync('./chess/chess.js', 'utf8')
        console.log('compiling script...')
        const script = new VMScript(code as unknown as string)
        script.compile()
        console.log('Script compiled.')
        console.log('Making VM...')
        const vm = new VM({
            // timeout: 1000,
            eval: false,
            wasm: false,
            fixAsync: true,
            sandbox: {
                console: {
                    log: (msg: string) => console.log('VM2: ' + msg)
                }
            }
        })
        vm.freeze(players, 'players')
        vm.run(script)
        const state = vm.run(`
            const g = new Game()
            g.start(players)
        `)
        console.log("new state", state)
    }
}