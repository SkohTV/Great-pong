# Great Pong
This project is a NodeJS website using express.js and socket.io to make a multiplayer pong game, available both in local mode (one computer) or online (two computer) with the use of websockets.<br>
\- Source code can be found on [GitHub](https://github.com/SkohTV/Great-pong) (https://github.com/SkohTV/Great-pong)<br>
\- Website is available at all time on [Adaptable](https://great-pong.adaptable.app) (https://great-pong.adaptable.app)



## Project Requirements

### Basic
- [x] Both player must be able to control themselves with displayed keys
- [x] Starting a round is done by pressing space or another displayed key
- [x] Possible to move the player and the ball before starting
- [x] When the ball touch left/right border, stop game, give point, then reengage
- [x] Score must be displayed and live updated
- [x] First player at 5 points with 2 points lead from other wins

## Advanced
- [x] Cool looking website
- [x] Highly configurable games
- [x] Local 1v1 gamemode
- [x] Online 1v1 gamemode
- [x] Deployed on a server
- [x] Well documented



## Project Structure

```
├── README.md             # Project documentation (you are here)
├── index.js              # Serverside router (entry point for application)
├── .editorconfig         # Editor configuration file
├── .gitignore            # Git ignore file
├── package.json          # Node.js project configuration file
└── client/               # Directory for client-side code
    ├── pages/            # Directory for HTML pages
    ├── scripts/          # Directory for JavaScript files
    ├── src/              # Directory for additional ressources (images)
    └── styles/           # Directory for style files (CSS & SASS)
```



## Hosting Yourself

### Prerequisites
To run this project, you need to have the following software installed on your system:

- Node.js (version 10 or above)
- npm (Node package manager)

### Setup
1. Clone the repo to your local machine
2. Install the dependancies by running : `npm install`
3. You can then start the server by running : `npm start` (it should print the port in use in terminal)
4. The server should then be available at http://localhost:3000