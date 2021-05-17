import './style/main.scss'
import Session from './session'
import Authentication from './authentication'
import Games from './games'
import Game from './game'

const indexSignInButton = document.getElementById('index-sign-in')
const indexPlayButton = document.getElementById('index-play')

const session = new Session()

const switchPage = (page: string) => {
    document.querySelectorAll('main > .page').forEach((e) => e.classList.add('hidden'))
    document.getElementById(`page-${page}`).classList.remove('hidden')
}

indexSignInButton.onclick = () => {
    if (!session.userInfo) {
        const authentication = new Authentication(session, () => switchToGames())
        authentication.render()
    } else {
        switchToGames()
    }
}

indexPlayButton.onclick = () => {
    if (!session.userInfo) {
        const authentication = new Authentication(session, () => switchToGame())
        authentication.render()
    } else {
        switchToGame()
    }
}

const switchToGames = () => {
    const games = new Games(session)
    games.render()
    switchPage('games')
}

const switchToGame = () => {
    const game = new Game(session)
    game.render()
    switchPage('game')
}
