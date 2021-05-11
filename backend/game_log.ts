/*

Alright so the way we want to do this is:

 1. Users can create games
 2. Users can upload code for these games to run whenever a player of the game makes a move
 3. Players can play a game
 4. When a player plays a move in a game that move is ran through the code
 5. The results of the move ran through the code is stored.


 Ok so the API should go like this:

 - the game should have a startGame() that returns an initial game state object and a makeMove() function that takes
 a players move.
 - The gamestate has states for public, private and each player.
 - Public state should have standardized field for finished, or accepting moves state, and scores per player

*/

class GameLog {

}