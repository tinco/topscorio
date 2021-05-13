import Session from './session'

class Games {
    session: Session

    constructor(session: Session) {
        this.session = session
    }

    get element() {
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
    }

    renderGames(games: any[]) {
        const newestGames = document.getElementById('newest-games')
        newestGames.innerHTML = games.map((game: any) => {
            return `
                <li data-game="${game.id}">
                    ${game.name}
                </li>
            `
        }).join("\n")
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