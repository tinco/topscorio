import express from "express"
import dotenv from "dotenv"
import redis from "redis"

dotenv.config()

const app = express()
const port = process.env.SERVER_PORT

const authStore = redis.createClient(process.env.AUTH_REDIS)

authStore.on("error", (error) => {
    console.error("REDIS_ERROR:", error)
})

authStore.setex("test", 600, "123", redis.print)

// define a route handler for the default home page
app.get( "/", ( req, res ) => {
    res.send( "Hello world!" )
} )

// start the Express server
app.listen( port, () => {
    console.log( `server started at http://localhost:${ port }` )
} )

