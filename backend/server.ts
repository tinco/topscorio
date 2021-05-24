import dotenv from "dotenv"
dotenv.config()

import express from "express"
import ws from "ws"

import SessionHandler from './session_handler.js'

import { dirname } from 'path'
import { fileURLToPath } from 'url'

const ROOT_DIR = dirname(fileURLToPath(import.meta.url))


const app = express()
const port = process.env.SERVER_PORT

const authWS = new ws.Server({ noServer: true })
authWS.on('connection', (socket, _head) => {
    const handler = new SessionHandler(socket)
    console.log('opened connection')
    socket.on('message', message => {
        handler.handleMessage(message as string)
    })
    socket.send(JSON.stringify({method: 'status', data: "ok"}))
})

// define a route handler for the default home page
app.get( "/api/", ( req, res ) => {
    res.json({
        status: "ok"
    })
})

app.use(express.static( ROOT_DIR + '/../frontend'))

// start the Express server
const server = app.listen( port, () => {
    console.log( `server started at http://localhost:${ port }` )
})

server.on('upgrade', (req, socket, head) => {
    console.log('received upgrade request')
    authWS.handleUpgrade(req, socket, head, (websocket) => {
        authWS.emit('connection', websocket, req, head)
    })
})
