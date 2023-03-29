import "./styles/Game.css";
import { useState } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { io } from "socket.io-client";
import notify_audio from './audios/notify.mp3'
import move_audio from './audios/move-self.mp3'
import Alert from "./Alert";

const socket = io("https://chesssdev.glitch.me/", {transports: ["websocket"]});
// const socket = io("http://localhost:8000/", { transports: ["websocket"] });

function Game() {
  const [chess, setchess] = useState(new Chess());
  const [position, setPosition] = useState(chess.fen());
  const [boardcolor, setboardcolor] = useState("white");
  const [showAlert, setShowAlert] = useState([false, "", false]);
  const [draw_state, setdraw_state] = useState(false);
  var notify = new Audio(notify_audio);
  var move_self = new Audio(move_audio);
  // Functions
  window.onload = () => {
    const params = new URLSearchParams(window.location.search);
    const name = params.get("name");
    const id = params.get("id");
    socket.emit("join", [name, id, position]);
    socket.emit("tell-color");
    document.getElementById("enemy_space").textContent = name;
    socket.on("listen-color", (colour) => {
      setboardcolor(colour);
      document.getElementById(
        "your_colour"
      ).textContent = `Your colour : ${colour}`;
      console.log(colour);
    });

  };

  window.beforeunload = () => {
    socket.emit("disconnect");
  };

  const checks = () => {
    if (chess.isGameOver() || draw_state === true) {
      if (
        chess.isDraw() ||
        chess.isInsufficientMaterial() ||
        chess.isStalemate() ||
        chess.isThreefoldRepetition() ||
        draw_state === true
      ) {
        document.getElementById("game_status").textContent =
          "Game Status: Draw!";
      } else if (chess.isCheckmate()) {
        const winner = chess.turn() === "w" ? "Black" : "White";
        document.getElementById(
          "game_status"
        ).textContent = `Game Status: ${winner} won!`;
      }
    }
    return 0;
  };

  const move = (sourceSquare, targetSquare) => {
    if (draw_state === false) {
      try {
        const old_fen = chess.fen();
        const move = chess.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: "q",
        });
        chess.load(old_fen);
        if (move === null) {
        } else {
          socket.emit("move", [sourceSquare, targetSquare]);
        }
      } catch {}
    }
  };

  const handleMove = (sourceSquare, targetSquare) => {
    console.log(chess.turn());
    try {
      chess.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });
      setPosition(chess.fen());
      document.getElementById("game_status").textContent =
        "Game Status: Playing!";
      checks();
      move_self.play()
    } catch {}
  };

  // Sockets

  socket.on("game-full", () => {
    setchess("");
    window.location.href = "about:blank";
  });

  socket.on("alert", (arr) => {
    setShowAlert(arr);
    notify.play();
    setTimeout(() => {
      setShowAlert([false, "", false]);
    }, 2500);
  });

  socket.on("opponent-name", (opponent_name) => {
    document.getElementById("name_space").textContent = opponent_name;
  });

  socket.on("self-opponent", (opponent_for_me) => {
    document.getElementById("name_space").textContent = opponent_for_me;
  });

  socket.on("draw-offered", (arr) => {
    setShowAlert(arr);
    setTimeout(() => {
      setShowAlert([false, "", false]);
    }, 60 * 1000);
  });

  socket.on("user-disconnect", (opponent) => {
    if (document.getElementById("name_space").textContent === opponent.name) {
      document.getElementById("name_space").textContent = "";
    }
  });

  socket.on("turn", (turn) => {
    document.getElementById("turn").textContent =
      "Turn: " + (turn === "white" ? "black" : "white");
  });

  socket.on("received-move", (move) => {
    handleMove(move[0], move[1]);
  });

  socket.on("draw-by-agreement", ()=>{
    document.getElementById("game_status").textContent = "Game Status: Draw by Agreement!"
    setdraw_state(true)
    document.getElementById("alert").style.opacity = 0; document.getElementById("alert").style.height = 0;document.getElementById("alert").style.width = 0;
  })

  return (
    <>
      {showAlert[0] && (
        <Alert className="alert" id="alert" func={()=>{socket.emit("draw-accepted");}} draw={showAlert[2]} message={showAlert[1]}  />
      )}
      <div className="all_div">
        <div className="board_">
          <p className="name_space">
            Opponent: <span id="name_space"></span>
          </p>
          <Chessboard
            id="BasicBoard"
            position={position}
            onPieceDrop={move}
            className="board"
            arePremovesAllowed={false}
            boardOrientation={boardcolor}
            animationDuration={100}
          />
          <p className="name_space">
            You: <span id="enemy_space"></span>
          </p>
        </div>
        <div className="game_status" id="game_status">
          Game Status: Not Started yet!
        </div>
        <div className="game_info">
          <h1 className="game_info_title">Some Game Info:-</h1>
          <div className="your_colour" id="your_colour"></div>
          <div className="your_colour" id="turn">
            Turn: white
          </div>
          <button
            className="button"
            onClick={() => {
              socket.emit("draw-offer");
            }}
          >
            Draw
          </button>
          <button
            className="button"
            onClick={() => {
              if (window.confirm("Are you sure you want to close this tab?")) {
                window.location.href = "https://chessdev.pages.dev/";
              }
            }}
          >
            Resign
          </button>
        </div>
      </div>
    </>
  );
}

export default Game;
