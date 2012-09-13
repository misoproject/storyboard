(function() {

  var config = {
    size : 6,
    board : [],
    flippedCards : []
  };

  var game = new Miso.Rig({

    initial : 'fillBoard',
    defer : true,

    log : function(messagesArray) {
      console.log("===\n" + messagesArray.join("\n"));
    },

    error : function(messagesArray) {
      console.error("XXX\n" + messagesArray.join("\n"));
    },

    printBoard: function() {
      var vals = [];
      for(var i = 0; i < config.size; i++) {
        for(var j = 0; j < config.size; j++) {
          if (config.board[i][j].show) {
            vals.push(config.board[i][j].v);
          } else {
            vals.push("?");
          }
        }
        console.log(vals.join(" | "));
        vals = [];
      }
    },

    scenes : {

      // this scene is responsible for filling out the board
      fillBoard : {

        enter : function() {

          // try to fill out the board. In case something
          // goes wrong, return false to exit this transition.
          if (this._fillBoard() === false) {
            return false;  
          }

        },

        _fillBoard: function() {
          // we have (size x size)/2 unique pieces
          // make sure it's an even size board!
          if ((config.size * config.size)/2 % 2 !== 0) {
            this.rig.log([
              "Board size must be an even multiple!"
            ]);
            return false;
          }

          var getRandomPosition = function(size) {
            return Math.floor((Math.random() * 100) % size);
          };

          var availableLocations = [];

          for (var i = 0; i < config.size; i++) {
            for (var j = 0; j < config.size; j++) {
              availableLocations.push([i,j]);
            }
          }
          var pos1, pos2, j;
          i = 0;
          
          while(availableLocations.length > 0) {
            
            // get row position
            j = getRandomPosition(availableLocations.length);
            pos1 = availableLocations[j];
            availableLocations.splice(j, 1);
            
            // get column position
            j = getRandomPosition(availableLocations.length);
            pos2 = availableLocations[j];
            availableLocations.splice(j, 1);

            // store it in board
            config.board[pos1[0]] = config.board[pos1[0]] || new Array(config.size);
            config.board[pos2[0]] = config.board[pos2[0]] || new Array(config.size);

            config.board[pos1[0]][pos1[1]] = {v:i, show:false};
            config.board[pos2[0]][pos2[1]] = {v:i, show:false};

            i++;
          }

          this.rig.log(["Initialized Board!"])
          return true;
        }

        
      },

      start : {
        enter : function() {
          this.rig.log([
            "Welcome to the memory game. Your board is:" +
            config.size + " x " + config.size + " large.",
            "You can flip a tile by calling flip(row, column)."
          ]);
        }
      },

      noneFlipped : {
        enter : function(){
          this.rig.log(["Let's flip two cards:"]);
        }
      },

      oneFlipped : {
        enter : function(r, c){
          // one card was flipped. Mark it as flipped.
          config.board[r][c].show = true;
          config.flippedCards.push(config.board[r][c]);

          // there's only one card flipped, 
          // tell us what it is and ask for another flip
          this.rig.log([
            "You have one card flipped! It is: [" +
            config.board[r][c].v + "]",
            "Flip another one."
          ]);
        }
      },

      twoFlipped : {
        enter : function(r, c) {
          // second card was flipped. Mark it as flipped.
          config.board[r][c].show = true;
          config.flippedCards.push(config.board[r][c]);

          // second card flip!
          this.rig.log([
            "You flipped the second card! It is: [" +
            config.board[r][c].v + "]"
          ]);
        }
      },

      checking : {
        enter : function() {
          
          // is this a match?
          return (config.flippedCards[0].v === config.flippedCards[1].v);

        }
      },

      goodFlip : {
        enter : function() {
          this.rig.log(["Yey! That's a match!"]);
        }
      },

      badFlip : {
        enter : function() {
          // flip both cards back
          config.flippedCards[0].show = false;
          config.flippedCards[1].show = false;
          config.flippedCards = [];
          this.rig.log(["Oh no! That's a bad flip"]);
        }
      },

      error : {
        enter : function(message) {
          this.rig.error([message]);
        }
      } 
    }
  });
  
  window.flip = function(r,c) {

    var value = config.board[r][c].v;

    // has this card already been flipped? If so
    // just go error
    if (config.board[r][c].show) {
      game.to("error", ["This card has already been flipped!"])
        .then(function() {
          game.to("noneFlipped");
        })
    }

    // how many flipped cards to we have?
    if (game.is("noneFlipped")) {
      game.to("oneFlipped", [r,c]);
    }
    else if (game.is("oneFlipped")) {
      
      game.to("twoFlipped", [r,c])
      game.to("checking")
        .done(function() {
          return game.to("goodFlip");
        })
        .fail(function() {
            return game.to("badFlip");
        })
        .always(function() {
          return game.to("noneFlipped");
        });

    }
  };

  window.board = game.printBoard;

  game.start();
  game.to("start").then(function() {
    game.to("noneFlipped");
  });


})();