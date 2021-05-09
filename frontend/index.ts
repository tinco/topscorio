import './style/main.scss'
import log from './log'
import Session from './session'
import Authentication from './authentication'

log("Hello World")

const session = new Session()

log('Built websocket')

const authentication = new Authentication(session)
authentication.render()
