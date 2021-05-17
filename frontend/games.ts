import Session from './session'

class Games {
    session: Session
    games: any[]

    constructor(session: Session) {
        this.session = session
        //@ts-ignore
        window['games'] = this
    }

    get element(): HTMLElement {
        return document.getElementById('games')
    }

    render() {
        const createButton = document.getElementById('games-create-game')
        createButton.onclick = () =>{
            document.getElementById('games-new-game-form').classList.add('hidden')
            this.addGame()
            return false
        } 

        this.session.on('newest-games', (data: any) => {
            this.games = data.games
            this.renderGames()
        })

        this.session.on('new-game', (game: any) => {
            this.games.unshift(game)
            this.renderGames()
        })

        this.session.getNewestGames()
    }

    renderGames() {
        const newestGames = document.getElementById('games-newest-games')
        newestGames.innerHTML = this.games.map((game: any) => {
            return `
                <li data-game="${game.id}" class="list-group-item">
                    ${game.name}
                </li>
            `
        }).join("\n")
    }

    addGame() {
        const name = (document.getElementById('games-game-name') as HTMLInputElement).value
        const code = (document.getElementById('games-game-code') as HTMLInputElement).value
        const gameInfo = { name, code }
        this.session.addGame(gameInfo)
    }
}

export default Games