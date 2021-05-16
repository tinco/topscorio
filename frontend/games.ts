import Session from './session'

class Games {
    session: Session
    openGames: any[] = []

    constructor(session: Session) {
        this.session = session
        //@ts-ignore
        window['games'] = this
    }

    get element(): HTMLElement {
        return document.getElementById('games')
    }

    render() {
        document.body.insertAdjacentHTML('beforeend',`
        <div id="games">
            <div id="addGameForm">
                <label for="game-name">Game name</label>
                <input type="text" id="game-name" />
                <label for="game-code">State progressing code for your game</label>
                <textarea type="text" id="game-code" rows="50" columns="120"></textarea>
                <button id="create-game">Create game</button>
            </div>
            <ul id="newest-games">
            </ul>
        </div>
        `)
        const createButton = document.getElementById('create-game')
        createButton.onclick = () => this.addGame()

        setInterval(() => this.getNewestGames(), 2000) // TODO use pubsub
        this.session.on('newest-games', (data: any) => this.renderGames(data.games)) 
        this.session.on('open-game', (data: any) => {
            this.openGames.push(data)
        })
    }

    renderGames(games: any[]) {
        const newestGames = document.getElementById('newest-games')
        newestGames.innerHTML = games.map((game: any) => {
            return `
                <li data-game="${game.id}">
                    ${game.name} <button class="play" data-game="${game.id}">Play</button>
                </li>
            `
        }).join("\n")

        this.element.querySelectorAll('button.play').forEach((e) => {
            e.addEventListener('click', () => this.playGame((e as HTMLElement).dataset.game))
        })
    }

    playGame(gameId: string) {
        let game = this.openGames.filter((g) => g.gameId === gameId)[0]
        if (game) {
            console.log('joining game', game)
            this.session.joinGame(game.gameLogId)
        } else {
            this.session.createGame(gameId)
        }
    }

    addGame() {
        const name = (document.getElementById('game-name') as HTMLInputElement).value
        const code = (document.getElementById('game-code') as HTMLInputElement).value
        const gameInfo = { name, code }
        this.session.addGame(gameInfo)
    }

    getNewestGames() {
        this.session.getNewestGames()
    }
}

export default Games