const express = require("express");
const socket  = require("socket.io");
const http = require("http");
const { Chess } = require("chess.js");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socket(server);

const game = new Chess();
let players = {};
let currentPlayer = "W";

app.set("view engine","ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.render("index", {title: "chess game"});
});

io.on("connection", function(uniquesocket) {
    console.log("connected");

    if(!players.white){
        players.white = uniquesocket.id;
        uniquesocket.emit("playerRole", "w");
    }
    else if(!players.black){
        players.black = uniquesocket.id;
        uniquesocket.emit("playerRole", "b");
    }
    else{
        uniquesocket.emit("spectatorRole");
    }

    uniquesocket.on("disconnet", function() {
        if(uniquesocket.id === players.white){
            delete players.white;
        }else if(uniquesocket.id === players.black){
            delete players.black;
        }
    })
});

uniquesocket.on("move", (move) => {
    try{
        if(Chess.turn() === "w" && uniquesocket.id !== players.white) return;
        if(Chess.turn() === "b" && uniquesocket.id !== players.black) return;

        const result = chess.move(move);
        if(result){
            currentPlayer = chess.turn();
            io.emit("move", move)
            io.emit("boardstate", chess.fen())
        }else{
            console.log("invalid move: ", move);
            uniquesocket.emit("invalidMove", move);
        }
    }catch(err){        
        console.log(err);
        uniquesocket.emit("invalid move: ", move);
    }
})

server.listen(3000, function() {
    console.log("listening on port:3000")
});