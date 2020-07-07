# Distributed Systems project.

Realtime crosswords multiplayer game.
Game data provided from https://github.com/doshea/nyt_crosswords.

__________________________________________________________________________________________________________________________________________________________________________
## Construction Architecture

System built based on microservices arquitecture, abble to support multiple games with multiple players(persistent connection).
Each game is created for players who have joined the queue, which also is abble to support multiple players and multiple types of queue(only implemented simple queue of n players)

### 1. User service
  - Handle only http requests: Registration, Login and Update Players scores
  
### 2. Store service
  - Not implemented(possible future feature)
  
### 3. Queue service
  - Handle http requests from users for Queue endpoints(only implemented one simple queue)
  - Handle websocket conection through SocketIO in order to maintain users state(possibility to handle multiple namespaces for multiple queues)
  - Queue state is cached in server
  
### 4. Game service
  - Handle http requests from queue service for Game endpoints(A namespace is created for each game)
  - Handle websocket conection through SocketIO in order to maintain game state to users(possibility to handle multiple namespaces for multiple games)
  - Game state is cached in server(Storing game's object should be a good future feature)
  
__________________________________________________________________________________________________________________________________________________________________________
Front-end built with ***React JS***.
Back-end built with ***Node JS***, ***Express JS*** and ***Mongoose***(MongoDB's ODM for users data), in addition of ***SocketIO*** websocket.
Project deployed on **Google Cloud Compute Engine** free tier f1-micro(unable to deploy on Google Cloud App Engine due to the fetch's restriction in NodeJS)


__________________________________________________________________________________________________________________________________________________________________________
## Testing
  To be able to test the project, the constant **CLOUD_IP** in the files `helpers/urls/urls.js` and `front/src/config/urls.js` should be changed to your current testing url or localhost for local testing. Also, configuring the file `userService/config/config.env` to another mongoDB cluster may be necessary.
  After that it's just needed to run `npm start` in every service root folder. 
  
Game titles are displayed in the browser's console at match's beggining(most of them are from NYT crossword)
answers for testing : https://www.xwordinfo.com/Crossword?date=mm/dd/yyyy
words by clue: https://www.wordplays.com/crossword-solver/
__________________________________________________________________________________________________________________________________________________________________________
## Game Rules
Ingame, "*down*" words can be locked selecting bottom part of cell and "*across*" words can be locked selecting top part of the cell.
Once the word is locked, the player can type the correspondent clue's answer.
Players cannot lock anothers players words.
Solved fields from solved words are skipped in case there is any in the selected word.
Match has a time limit and score is based on the sum of player's solved words lenght.
At the end of the game, game is finished and player's scores are updated.




