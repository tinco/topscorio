import express from "express"
import dotenv from "dotenv"
import redis from "redis"
import mail from "@sendgrid/mail"

dotenv.config()

const app = express()
const port = process.env.SERVER_PORT

const authStore = redis.createClient(process.env.AUTH_REDIS)

authStore.on("error", (error) => {
    console.error("REDIS_ERROR:", error)
})

authStore.setex("test", 600, "123", redis.print)

mail.setApiKey(process.env.SENDGRID_API_KEY)

const msg = {
  to: 'mail@tinco.nl',
  from: 'mail@tinco.nl', // Change to your verified sender
  subject: 'Sending with SendGrid is Fun',
  text: 'and easy to do anywhere, even with Node.js',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>',
}

mail.send(msg)
  .then(() => {
    console.log('Email sent')
  })
  .catch((error) => {
    console.error(error)
  })

// define a route handler for the default home page
app.get( "/", ( req, res ) => {
    res.send( "Hello world!" )
} )

// start the Express server
app.listen( port, () => {
    console.log( `server started at http://localhost:${ port }` )
} )

