# Xswords

Realtime crosswords multiplayer game.
Game data provided from https://github.com/doshea/nyt_crosswords.

__________________________________________________________________________________________________________________________________________________________________________
## Construction Architecture

System built based on microservices arquitecture, abble to support multiple games with multiple players(persistent connection).

Each game is created for players who have joined the queue, which also is abble to support multiple players and multiple types of queue(only implemented simple queue of n players)

### 1. User service
  - Handle only http requests: Registration, Login and Update Players scores

### 2. Game service
  - Handle http requests from queue service for Game endpoints(A namespace is created for each game)
  - Handle websocket conection through SocketIO in order to maintain game state to users(possibility to handle multiple namespaces for multiple games)
  - Game state is cached in server(Storing game's object should be a good future feature)  
  
### 3. Queue service
  - Handle http requests from users for Queue endpoints(only implemented one simple queue)
  - Handle websocket conection through SocketIO in order to maintain users state(possibility to handle multiple namespaces for multiple queues)
  - Queue state is cached in server
  
### 4. Store service
  - Not implemented(possible future feature) 

### 5. Front-end service
  - Client game interface

  
__________________________________________________________________________________________________________________________________________________________________________
Front-end built with ***React JS***.

Back-end built with ***Node JS***, ***Express JS*** and ***Mongoose***(MongoDB's ODM for users data), in addition of ***SocketIO*** websocket.

Project available with docker-compose, which has an internal network for inter-container communication

__________________________________________________________________________________________________________________________________________________________________________

  ## Testing with Docker
  
   The file `/deployments/docker-compose.yml` has the configuration to build the containers for database, health monitoring, nginx server entry point and for each service with their `Dockerfiles`, which doesn't expose ports to the outside world by theirselves.
   
   The only entry point to the application is throught nginx server at port 8080 which acts as a api gateway, managing reverse proxy and load balance with centralized authorization making use of auth-subrequest to user service.
   
   ![architecture](https://github.com/esteveslima/xswords/blob/master/assets/diagram/xswords-docker-compose-structure.png)
   
   To test the application with this architecture, the environment variables at `/deployments/docker-compose.yml` that adjust matches/queues parameters and containers communication can be modified to suit your project changes, such as host and port changes for a deployment. If the current configuration is modified, be sure that the file `/deployments/nginx/config/nginx.conf` match with the project.
   
   That being said, you can run `docker-compose up --build --detach` at folder `/deployments` to build the application with docker-compose. When the build finishes, the access to your domain(or localhost) at port 8080 can be done.
    
 ## Testing manually  
 
  Testing manually **don't includes any auth** due this is only done by nginx server auth-subrequest from docker-compose architecture.
  
  The environment variables in each service `/config/config.env` that adjust matches/queues parameters and containers communication can be modified, just make sure to match with `/front/.env` environment variables that make the communication from the client to the servers.
  
  It is required to install mongodb locally, creating a local database and adjusting MONGO_URI variable at `/userService/config/config.env`(currently using a db named 'xswords' without credentials), or provide a remote cluster to the MONGO_URI environment variable.
  
  Creating a local db:
  ```bash
    mongo
    use <db-name>
    db.users.insertOne({ name: 'first' })
  ```
 
  After that, run `npm start` in each service root folder to start all servers and the access to localhost:3000 can be done.
  
<br/><br/>

Game titles are displayed in the browser's console at match's beggining(most of them are from NYT crossword)

answers for testing : https://www.xwordinfo.com/Crossword?date=mm/dd/yyyy

words by clue: https://www.wordplays.com/crossword-solver/
__________________________________________________________________________________________________________________________________________________________________________
## Game Rules
  - Ingame, "*down*" words can be locked selecting bottom part of cell and "*across*" words can be locked selecting top part of the cell.
  - Once the word is locked, the player can type the correspondent clue's answer.
  - Players cannot lock anothers players words.
  - Solved fields from solved words are skipped in case there is any in the selected word.
  - Match has a time limit and score is based on the sum of player's solved words lenght.
  - At the end of the game, game is finished and player's scores are updated.
__________________________________________________________________________________________________________________________________________________________________________
## Known Issues
 - Sometimes, the api service that provides the game data responds with a bigger matrix match or with some unhandled modifications from the part of this project, leading to some unexpected behaviours in game;
 - Everytime a player selects a matrix's word, all hovered words by other players highlighted locally lose prominence because the list of highlighted words is "hard updated" by the server, which can cause some weird feeling ingame;
 - There is no caching system, so if the game server fails all running matches are lost, similarlly to the queue server making all players lose the possibility of reconecction;
 - Some words doesn't finish the typing process after filling all the fields, requiring to type a few more letters to achieve that. Also there is no depht search looking for another words possibly being solved by extension, leaving them to be claimed to the first one to select it and type anything. ~~(the words validation needs a refactoring)~~
