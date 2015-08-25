angular.module('app.chess', ["ui.router", 'ngResource', 'ngCkeditor', 'ngTagsInput', 'ngSanitize', 'ngAnimate', 'ui.bootstrap', 'angularFileUpload'])
.config(
    ['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
        $stateProvider
        .state('chess', {
            url: '/chess',
            templateUrl: 'views/chess.html',
            controller: 'chessController',
        })
    }
    ]
    );

angular.module('myapp').controller('chessController', chessController);


function chessController($scope, $location,Socket, $log) {
   var socket = Socket.socket;
   Socket.start();
   var vm = this;
   $scope.users = []; 
// user conectados
socket.on('nicknames', function(nicknames) {
   $scope.users = [];         
   $scope.$apply(function() {               
    for (var i in nicknames) {
        $scope.users.push({id: nicknames[i].nick, name: nicknames[i].nick, inline: true});
    }
});
});
$scope.openModal=function(name){
    $('#'+name).modal('show')
}

$scope.user_data='';
$scope.loadDataUser=function(user){
    $scope.user_data=user;
}

    var color_player_game = 'b';// define color player

    var color_player_name = 'white';
    var color_contrario_name = 'black';
    var board,
    boardEl = $('#board'),
    game = new Chess(),
    squareToHighlight;
    statusEl = $('#status'),
    fenEl = $('#fen'),
    pgnEl = $('#pgn');

    var move_none = /^b/;
    if (color_player_game == 'b') {
        move_none = /^w/;
        color_player_name = 'black';
        var color_contrario_name = 'white';
    }
    var removeHighlights = function(color) {
        boardEl.find('.square-55d63')
        .removeClass('highlight-' + color);
    };

// do not pick up pieces if the game is over
// only pick up pieces for White
var onDragStart = function(source, piece, position, orientation) {

    if (game.in_checkmate() === true || game.in_draw() === true ||
        piece.search(move_none) !== -1) {
        return false;
}
};

var makeRandomMove = function() {
    if (game.in_checkmate() === true) {
        alert('mate');
    }
    var possibleMoves = game.moves({
        verbose: true
    });
        // game over
        if (possibleMoves.length === 0)
            return;
        var randomIndex = Math.floor(Math.random() * possibleMoves.length);
        var move = possibleMoves[randomIndex];
        game.move(move.san);
        // highlight black's move
        removeHighlights(color_contrario_name);
        boardEl.find('.square-' + move.from).addClass('highlight-' + color_contrario_name);
        squareToHighlight = move.to;

        // update the board to the new position
        board.position(game.fen());
    };

    var onDrop = function(source, target) {
        removeGreySquares();
        // see if the move is legal

        var move = game.move({
            from: source,
            to: target,
            promotion: 'q' // NOTE: always promote to a queen for example simplicity
        });

        // illegal move
        if (move === null)
            return 'snapback';

        updateStatus();
        // highlight white's move
        removeHighlights(color_player_name);
        boardEl.find('.square-' + source).addClass('highlight-' + color_player_name);
        boardEl.find('.square-' + target).addClass('highlight-' + color_player_name);

        // make random move for black
        window.setTimeout(makeRandomMove, 250);
    };

    var onMoveEnd = function() {
        boardEl.find('.square-' + squareToHighlight)
        .addClass('highlight-' + color_contrario_name);
    };
// update the board position after the piece snap
// for castling, en passant, pawn promotion
var onSnapEnd = function() {
    board.position(game.fen());
};

var onMouseoverSquare = function(square, piece) {
        // get list of possible moves for this square
        var moves = game.moves({
            square: square,
            verbose: true
        });

        // exit if there are no moves available for this square
        if (moves.length === 0)
            return;

        // highlight the square they moused over
        greySquare(square);
        // highlight the possible squares for this piece
        for (var i = 0; i < moves.length; i++) {
            greySquare(moves[i].to);
        }
    };
    var onMouseoutSquare = function(square, piece) {
        removeGreySquares();
    };
    var removeGreySquares = function() {
        $('#board .square-55d63').css('background', '');
    };

    var greySquare = function(square) {
        var squareEl = $('#board .square-' + square);

        var background = '#a9a9a9';
        if (squareEl.hasClass('black-3c85d') === true) {
            background = '#696969';
        }

        squareEl.css('background', background);
    };

    var onChange = function(oldPos, newPos) {
        console.log("Position changed:");
        console.log("Old position: " + ChessBoard.objToFen(oldPos));
        console.log(oldPos);
        console.log("New position: " + ChessBoard.objToFen(newPos));
        console.log("--------------------");
    };

    var updateStatus = function() {
        var status = '';

        var moveColor = 'White';
        if (game.turn() === 'b') {
            moveColor = 'Black';
        }

        // checkmate?
        if (game.in_checkmate() === true) {
            status = 'Game over, ' + moveColor + ' is in checkmate.';
        }

        // draw?
        else if (game.in_draw() === true) {
            status = 'Game over, drawn position';
        }

        // game still on
        else {
            status = moveColor + ' to move';

            // check?
            if (game.in_check() === true) {
                status += ', ' + moveColor + ' is in check';
            }
        }

        statusEl.html(status);
        fenEl.html(game.fen());
        pgnEl.html(game.pgn());
    };
    var cfg = {
        orientation: color_player_name,
        draggable: true,
        position: 'start',
        onDragStart: onDragStart,
        onDrop: onDrop,
        onMoveEnd: onMoveEnd,
        onSnapEnd: onSnapEnd,
        showNotation: true,
        onMouseoutSquare: onMouseoutSquare,
        onMouseoverSquare: onMouseoverSquare,
        onChange: onChange
    };
    board = new ChessBoard('board', cfg);
    if (color_player_game == 'b') {
        window.setTimeout(makeRandomMove, 250);
    }

    reloj = new timer.Timer("game-time");
    reloj.restart();

    $('#showOrientationBtn').on('click', function() {
        console.log("Board orientation is: " + board.orientation());
    });

    $('#flipOrientationBtn').on('click', board.flip);

    $('#whiteOrientationBtn').on('click', function() {
        board.orientation('white');
    });

    $('#blackOrientationBtn').on('click', function() {
        board.orientation('black');
    });
    $('#atras').on('click', function() {
        alert(game.history())
    });
    $('#startBtn').on('click', board.start);
    $(window).resize(board.resize);
}
