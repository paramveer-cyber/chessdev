import "./styles/Game.css";
import { useState } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { io } from "socket.io-client";
import notify_audio from "./audios/notify.mp3";
import move_audio from "./audios/move-self.mp3";
import Alert from "./Alert";

// const socket = io("https://chesssdev.glitch.me/", {transports: ["websocket"]});
const socket = io("http://localhost:8000/", { transports: ["websocket"] });

function Game() {
  //Variables
  const [chess, setchess] = useState(new Chess());
  const [moveFrom, setMoveFrom] = useState("");
  const [rightClickedSquares, setRightClickedSquares] = useState({});
  const [moveSquares, setMoveSquares] = useState({});
  const [optionSquares, setOptionSquares] = useState({});
  const [position, setPosition] = useState(chess.fen());
  const [boardcolor, setboardcolor] = useState("white");
  const [showAlert, setShowAlert] = useState([false, "", false]);
  const [draw_state, setdraw_state] = useState(false);
  var notify = new Audio(notify_audio);
  var move_self = new Audio(move_audio);

  // Functions

  function getMoveOptions(square) {
    const moves = chess.moves({
      square,
      verbose: true,
    });
    if (moves.length === 0) {
      return false;
    }

    const newSquares = {};
    moves.map((move) => {
      newSquares[move.to] = {
        background:
          chess.get(move.to) &&
          chess.get(move.to).color !== chess.get(square).color
            ? "radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)"
            : "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
        borderRadius: "50%",
      };
      return move;
    });
    newSquares[square] = {
      background: "rgba(255, 255, 0, 0.4)",
    };
    setOptionSquares(newSquares);
    return true;
  }

  function onSquareClick(square) {
    setRightClickedSquares({});
    function resetFirstMove(square) {
      const hasOptions = getMoveOptions(square);
      if (hasOptions) setMoveFrom(square);
    }
    if (!moveFrom) {
      resetFirstMove(square);
      return;
    }
    if (move === null) {
      resetFirstMove(square);
      return;
    }
    setMoveFrom("");
    setOptionSquares({});
  }

  function onSquareRightClick(square) {
    const colour = "rgba(255, 0, 0, 0.6)";
    setRightClickedSquares({
      ...rightClickedSquares,
      [square]:
        rightClickedSquares[square] &&
        rightClickedSquares[square].backgroundColor === colour
          ? undefined
          : { backgroundColor: colour },
    });
  }

  window.onload = () => {
    setMoveSquares({});
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
    try {
      chess.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });
      setPosition(chess.fen());
      document.getElementById(
        "game_status"
      ).textContent = `Game Status:Playing as ${
        document.getElementById("your_colour").textContent.charAt(13) +
        document.getElementById("your_colour").textContent.charAt(14) +
        document.getElementById("your_colour").textContent.charAt(15) +
        document.getElementById("your_colour").textContent.charAt(16) +
        document.getElementById("your_colour").textContent.charAt(17) +
        document.getElementById("your_colour").textContent.charAt(18)
      }!`;
      checks();
      move_self.play();
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

  socket.on("draw-by-agreement", () => {
    document.getElementById("game_status").textContent =
      "Game Status: Draw by Agreement!";
    setdraw_state(true);
    document.getElementById("alert").style.opacity = 0;
    document.getElementById("alert").style.height = 0;
    document.getElementById("alert").style.width = 0;
  });

  function add_msg(msg, name_ = "You"){
    const query = document.querySelector(".chat-box")
    let element = document.createElement("div");
    element.innerText = `${name_}: ${msg}`;
    element.classList.add("msg");
    element.classList.add("opponent_msg");
    query.append(element);
  }

  socket.off("got_a_message").on("got_a_message", (msg)=>{
    add_msg(msg)
  });

  return (
    <>
      {showAlert[0] && (
        <Alert
          className="alert"
          id="alert"
          func={() => {
            socket.emit("draw-accepted");
          }}
          draw={showAlert[2]}
          message={showAlert[1]}
        />
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
            onSquareClick={onSquareClick}
            onSquareRightClick={onSquareRightClick}
            customBoardStyle={{
              borderRadius: "4px",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
            }}
            customSquareStyles={{
              ...moveSquares,
              ...optionSquares,
              ...rightClickedSquares,
            }}
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
        <div className="chat-box"></div>
        <input
          className="msg_input"
          id="input_msg"
          type="text"
          placeholder="Enter your message..."
        />
        <button
          className="send"
          onClick={() => {
            socket.emit("send_button_pressed", document.getElementById("input_msg").value);
            console.log("CLICK")
            const query = document.querySelector(".chat-box")
            let element = document.createElement("div");
            element.innerText = `You: ${document.getElementById("input_msg").value}`;
            element.classList.add("msg");
            element.classList.add("my_msg");
            query.append(element);
            document.getElementById("input_msg").value = ""
          }}
          id="send"
        >
          Send &#8594;
        </button>
      </div>
    </>
  );
}

export default Game;
