import './style/main.scss'
import log from './log'
import Session from './session'
import Authentication from './authentication'
import Games from './games'
import Game from './game'

log("Hello World")

const session = new Session()

log('Built websocket')

const authentication = new Authentication(session)
authentication.render()

const games = new Games(session)
games.render()

const game = new Game(session)
game.render()