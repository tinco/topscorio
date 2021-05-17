Topscorio
=========

Keeps scores for gamers. Check out https://www.topscorio.com

Running
====

Make a `.env` file like so:

```
NODE_ENV=development
SERVER_PORT=5020
SESSION_REDIS=redis://default:<pass>@<url>
USERS_REDIS=redis://default:<pass>@<url>
GAMES_REDIS=redis://default:<pass>@<url>
GAME_LOGS_REDIS=redis://default:<pass>@<url>
SENDGRID_API_KEY=<SENDGRID_API_KEY>
```

Filling in database addresses, passwords and the sendgrid api key as needed. I have used a different database for each,
but I don't see a reason why it couldn't all be the same database url's if you're just testing it out.

Make sure that RediJSON is enabled for the databases.

Then in one terminal run:

```
npm install
npm run backend
```

and then in another terminal run

```
npm run frontend
```

And navigate to http://localhost:5010 in your browser.

Game example
=====

The app has an example Chess game implemented, open up multiple browser sessions to test this.

![Screenshot showing online multiplayer chess](https://i.imgur.com/59ZEyt8.png)

Architecture
=======

The frontend connects to the backend through a websocket.

The frontend sends requests to the backend, requesting subscriptions on channels, and executing commands. The backend
broadcasts channels to all connected clients, and sends messages with updates as responses to client commands.

User sessions are stored in the SESSION_REDIS database, with an expiry set.

User information is stored in USERS_REDIS, it is recommended persistence is enabled for this database.

Games are saved in GAMES_REDIS, this should also be persisted.

Game logs are instances of players using a game together. This is where all game moves and states are saved. Persistence
is also recommended here.