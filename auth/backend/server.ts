import express from "express"
import dotenv from "dotenv"
import redis from "redis"
import mail from "@sendgrid/mail"
import ws from "ws"

dotenv.config()

const app = express()
const port = process.env.SERVER_PORT

const authStore = redis.createClient(process.env.AUTH_REDIS)

authStore.on("error", (error) => {
    console.error("REDIS_ERROR:", error)
})

authStore.setex("test", 600, "123", redis.print)

mail.setApiKey(process.env.SENDGRID_API_KEY)

// const msg = {
//   to: 'mail@tinco.nl',
//   from: 'mail@tinco.nl', // Change to your verified sender
//   subject: 'Sending with SendGrid is Fun',
//   text: 'and easy to do anywhere, even with Node.js',
//   html: '<strong>and easy to do anywhere, even with Node.js</strong>',
// }

// mail.send(msg)
//   .then(() => {
//     console.log('Email sent')
//   })
//   .catch((error) => {
//     console.error(error)
//   })

const authWS = new ws.Server({ noServer: true })
authWS.on('connection', (socket, _head) => {
  socket.on('message', message => console.log(message))
})

// define a route handler for the default home page
app.get( "/", ( req, res ) => {
    res.send( "Hello world!" )
} )

app.post( "/authenticate", ( req, res) => {
    // we generate a token and save it in redis
    // we start listening on a websocket for a confirmation
    // we start listening internally for a confirmation
    // then we send an e-mail
    // when the link in the e-mail is clicked
})

// start the Express server
const server = app.listen( port, () => {
    console.log( `server started at http://localhost:${ port }` )
} )

server.on('upgrade', (req, socket, head) => {
    authWS.emit('connection', socket, req, head)
})
