import express from "express"
import dotenv from "dotenv"
import Redis from "ioredis"
import mail from "@sendgrid/mail"
import ws from "ws"
import cryptoRandomString from 'crypto-random-string'

dotenv.config()

const app = express()
const port = process.env.SERVER_PORT

const authStore = new Redis(process.env.AUTH_REDIS)

authStore.on("error", (error) => {
    console.error("REDIS_ERROR:", error)
})

mail.setApiKey(process.env.SENDGRID_API_KEY)


const authWS = new ws.Server({ noServer: true })
authWS.on('connection', (socket, _head) => {
  socket.on('message', message => console.log(message))
})

// define a route handler for the default home page
app.get( "/", ( req, res ) => {
    res.send( "Hello world!" )
} )

const handleAuthReq = async (email: string) : Promise<any> => {
    // we start listening on a websocket for a confirmation
    // we start listening internally for a confirmation
    // then we send an e-mail
    // when the link in the e-mail is clicked
    const token = cryptoRandomString({length: 10})
    const redisResult = await authStore.setex(token, 600, JSON.stringify({
        email: email
    }))

    const mailResult = await mail.send({
        to: 'mail@tinco.nl',
        from: 'mail@tinco.nl', // Change to your verified sender
        subject: 'Sending with SendGrid is Fun',
        text: 'and easy to do anywhere, even with Node.js',
        html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    })

    return {
        tokenResult: redisResult,
        mailResult: mailResult
    }
}

app.post( "/authenticate", async ( req, res) => {
    // we generate a token and save it in redis


    // res.json({ result: redisResult })
})

// start the Express server
const server = app.listen( port, () => {
    console.log( `server started at http://localhost:${ port }` )
} )

server.on('upgrade', (req, socket, head) => {
    authWS.emit('connection', socket, req, head)
})
