# ♟️ ChessDev — Real-Time Multiplayer Chess

ChessDev is a real-time multiplayer chess application built using React, Socket.IO, and chess.js, enabling two players to play a synchronized chess match over the web.

The project emphasizes real-time communication and client-side game logic, without relying on AI or chess engines.

## 🔗 Live Site: [Link](https://chessdev.pages.dev/)

## 🎮 How to Use the Website

1. Open the ChessDev website.
2. Enter your name when prompted.
3. Create a new game to generate a unique game link.
4. Share the game link with another player.
5. The second player opens the link and joins the game.
6. Once both players are connected, the chessboard becomes active.
7. Players take turns making moves in real time.
8. Illegal moves are automatically rejected.
9. The game continues until checkmate, draw, or resignation.

## 🚀 Features

- Real-time multiplayer gameplay using WebSockets
- Legal move validation via chess.js
- Turn-based move enforcement
- Move and notification sound effects
- In-game alerts for invalid moves
- Interactive and responsive chessboard UI

## 🛠 Tech Stack

- Frontend: React, react-chessboard, chess.js
- Backend: Node.js, Socket.IO

## ▶️ Getting Started

### Clone the repository

$ git clone https://github.com/your-username/chessdev.git  
$ cd chessdev

### Install dependencies

$ npm install

### Start the application

$ npm start

The application will run at:  
http://localhost:3000

Make sure the Socket.IO backend server is running before starting the game.

