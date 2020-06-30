Distributed Systems project.

Realtime crosswords multiplayer game.
Game data provided from https://github.com/doshea/nyt_crosswords.

System built based on microservices arquitecture, abble to support multiple games with multiple players(persistent connection).
Each game is created for players who have joined the queue, which also is abble to support multiple players and multiple types of queue(only implemented simple queue of n players)

Ingame, "down" words can be locked selecting upward part of cell and "across" words can be locked selecting downward part of the cell.
Once the word is locked, the player can type the correspondent clue's answer.
Players cannot lock anothers players words.
Solved fields from solved words are skipped in case there is any in the selected word.
Match has a time limit and score is based on the sum of player's solved words lenght.
On the end of the game, game is finished and player's scores are updated.

Front-end built with React JS.
Back-end built with Node JS, Express JS and Mongoose(MongoDB's ODM for users data), in addition of SocketIO websocket.
Project deployed on Google Cloud Compute Engine free tier f1-micro(unable to deploy on Google Cloud App Engine due to the fetch's restriction in NodeJS)
