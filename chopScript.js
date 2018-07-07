var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var returning = false;
var movingHandY = 0;
var movingHandX = 0;
var moving = false;
var handImg = new Image();
var diagonal = false;
var turn = 0;
var lastTurn = 1;
var theException = 0;
var offsetX = 0;;
var offsetY = 0;
var unswitching = false;
var gameOver = false;
var switching = false;
handImg.src = "./whole_hand.png";
var fingerImgs = [];

for (var i = 0; i < 4; i ++) {
    fingerImgs.push(new Image());
    fingerImgs[i].src = "./finger" + (i + 1).toString() + ".png";
}
canvasScale = 0.6;
canvas.width = 2000;
canvas.height = 1600;

document.body.addEventListener("click", function (event) {

    if (gameOver) {
        document.location.reload();
    }
    if (moving || switching || players[turn].controlMethod != "mouse") {return;}
    
    var x = Math.round((event.clientX - offsetX) / canvasScale );
    var y = Math.round((event.clientY - offsetY) / canvasScale );
    var yMin = turn * 800;
    var yMax = (turn + 1) * 800;

    if (theException) {
        if (x > 650 && y > 760 && x < 800 && y < 810) {
            players[turn].move(5);
            theException = false;
        }

        if (x > 820 && y > 760 && x < 970 && y < 810) {
            theException = false;
            turn = (turn == 0) ? 1 : 0;
        }

        return;
    }

    if (y > yMin && y < yMax && x < 1600) {
        if (players[turn].selectedHand == 0) {
            players[turn].selectedHand = (x > 800) ? 2 : 1;
        }
        else if (x > 800 && players[turn].selectedHand == 2 || x <= 800 && players[turn].selectedHand == 1) {
            players[turn].selectedHand = 0;
        }

        else {
            players[turn].selectedHand = 0;
            players[turn].move(4);
        }
        
    }

    else if (players[turn].selectedHand != 0) {
        var otherPlayer = (turn == 0) ? 1 : 0;
        
        yMin = otherPlayer * 800;
        yMax = (otherPlayer + 1) * 800;
        
        if (y > yMin && y < yMax && x < 1600) {
            players[turn].move((x > 800) ? 2 : 1);
        }
    }

});




var players = [];
players[0] = new Player(1);
players[1] = new Player(2);

function Player (playerNum) {
    
    this.number = playerNum;
    
    this.chosenHand = 0;
   
    this.controlMethod = "mouse";
    
    
    this.move = function(num) {
        if (num < 3) {
            var otherPlayer = players[(this.number == 1) ? 1 : 0];
            if (otherPlayer.hands[num - 1] == 0) {
                return;
            }
            this.chosenHand = num;
            moving = true;
            if (this.selectedHand != num) {
                diagonal = true;
            }
        }
        else {
            var tests = [[0,2],[0,3],[0,4],[1,1],[1,2],[1,3],[1,4],[2,2],[2,3],[2,4],[3,3]];
            for (let i = 0; i < tests.length; i ++) {
                if (testHands(...tests[i])) {
                    switching = true;
                    return;
                }
            }
           
            
        }
        
    }

    this.reachedHand = function () {
        var otherPlayer = players[(this.number == 1) ? 1 : 0];
        otherPlayer.hands[this.chosenHand - 1] += this.hands[this.selectedHand - 1];
        if (otherPlayer.hands[this.chosenHand - 1] >= 5) {
            otherPlayer.hands[this.chosenHand - 1] = 0;
        }


        if (otherPlayer.hands[0] == 0 && otherPlayer.hands[1] == 0) {
            ctx.clearRect(0,0,2000,1600);
            gameOver = true;
            ctx.fillRect(0,0,2000,1600);
            ctx.fillStyle = "rgb(255,255,255)";
            ctx.font="70px Verdana";
            ctx.fillText("Player " + this.number + " won!",800,800);
            ctx.font="35px Verdana";
            ctx.fillText("Click anywhere to restart",800,1000);
            
            
        }
        else {
            turn = (turn == 0) ? 1 : 0;
        }
    }


    this.finishedSwitching = function () {
        var tests = [[0,2],[0,3],[0,4],[1,1],[1,2],[1,3],[1,4],[2,2],[2,3],[2,4],[3,3]];
        var answers = [[1,1],[1,2],[2,2],[2,0],[3,0],[2,2],[2,3],[1,3],[1,4],[3,3],[2,4]];
        for (let i = 0; i < tests.length; i++) {
            if (testHands(...tests[i])) {
                this.hands = answers[i].slice();
                if (i == 2) {
                    theException = turn + 1;
                }
                return;
            }
        }
    }

    this.hands = [1,1];

    this.selectedHand = 0;
}

function testHands (num1,num2) {
    if ((players[turn].hands[0] == num1 && players[turn].hands[1] == num2) || (players[turn].hands[0] == num2 && players[turn].hands[1] == num1)) {
        return true;
    }
    return false;
}


var imagesToDraw = [fingerImgs[0]];


function drawImage(image, x, y, degrees,flip){
    let w = 800;
    let h = 800;
    ctx.save();
    
    
    if (flip == true) {
        //Rotate the canvas
        ctx.translate(x+w/2, y+h/2);
        ctx.rotate(degrees*Math.PI/180);
        ctx.translate(-x-w/2, -y-h/2);

        //Flip the canvas
        ctx.translate(x + w/2 ,0);
        ctx.scale(-1, 1);
        ctx.translate(-(x + w/2),0);
        
    }
    else {
        ctx.translate(x+w/2, y+h/2);
        ctx.rotate(degrees*Math.PI/180.0);
        ctx.translate(-x-w/2, -y-h/2);
    }
    
    ctx.drawImage(image, x, y, w, h);
    ctx.restore();
  }


var interval = setInterval(drawImages,100);



function drawImages () {
    //Position the canvas
    var smallestDimension = Math.min(window.innerHeight,window.innerWidth);
    canvasScale = smallestDimension / 2000;
    canvas.style.transform = "scale(" + canvasScale + ")";
    offsetX = window.innerWidth / 2 - 0.5 * canvasScale * 2000;
    offsetY = window.innerHeight / 2 - 0.5 * canvasScale * 1600;
    canvas.style.left = offsetX + "px";
    canvas.style.top = offsetY + "px";
    
    if (gameOver) {
        return;
    }
    //Clear it
    ctx.clearRect(0,0,1600,1600);
    
    

    for (var p = 0; p < 2; p++) {
        
        var movingSpeed = 60;
        var currentPlayer = players[p];
        for (var h = 0; h < 2; h ++) {
            let a = 180 - 180 * p;
            var flip = false;
            if (p + h == 0 || p + h == 2) {flip = true;}
            let x = h*800;
            let y = p*800;
            if (currentPlayer.selectedHand == h + 1 && switching == false) {
                
                if (returning == true) {
                    if (diagonal) {movingHandX -= (h == 0) ? movingSpeed : -movingSpeed;}
                    movingHandY -= (p == 0) ? movingSpeed : -movingSpeed;
                    y += movingHandY;
                    x += movingHandX;
                    if (movingHandY == 0) {
                        diagonal = false;
                        moving = false;
                        returning = false;
                        currentPlayer.selectedHand = 0;
                    }
                }
                else if (moving == true) {
                    if (diagonal) {movingHandX += (h == 0) ? movingSpeed : -movingSpeed;}
                    movingHandY += (p == 0) ? movingSpeed : -movingSpeed;
                    y += movingHandY;
                    x += movingHandX;
                    if ((Math.abs(movingHandY) > 300 && !diagonal) || (diagonal && Math.abs(movingHandX) > 700)) {
                        returning = true;
                        currentPlayer.reachedHand();
                    }
                }
                else {
                    x += Math.round(Math.random() * 30);
                }
                
            }
            if (p == turn && (switching || unswitching)) {
                if (movingHandX > 0 && unswitching == true) {
                    movingHandX -= movingSpeed;
                }

                else if (movingHandX <= 0 && unswitching == true) {
                    switching = false;
                    unswitching = false;
                    currentPlayer.selectedHand = 0;
                    if (!theException) {turn = (turn == 0) ? 1 : 0;}

                }
                else if (switching == true) {
                    movingHandX += movingSpeed;
                }
                
                if (movingHandX >= 300 && switching == true) {
                    unswitching = true;
                    currentPlayer.finishedSwitching();
                }
                x += (h == 0) ? movingHandX : -movingHandX;
            }
            if (!gameOver) {
                var fingerCount = currentPlayer.hands[h];
                drawImage(handImg,x,y,a,flip);
                for (let f = 3; f >= 4 - fingerCount; f--) {
                    drawImage(fingerImgs[f],x,y,a,flip);
                }
            }
        }
        
    
    }

    if (theException == turn + 1) {
        ctx.font="20px Verdana";
        ctx.fillStyle = "rgb(0,100,0)";
        ctx.fillRect(650,750,150,60);
        ctx.fillRect(820,750,150,60);
        ctx.fillStyle = "rgb(255,255,255)";
        ctx.fillText("Switch Again",660,790);
        ctx.fillText("End Turn",850,790);
        ctx.fillStyle = "rgb(0,0,0)";
        ctx.font="45px Verdana";
    }

    
    
    if (lastTurn != turn) {
        if (turn == 0 && players[turn].controlMethod != "mouse") {control();}
        ctx.font="45px Verdana";
        ctx.clearRect(1600,0,400,1600);
        ctx.fillText("-Player " + (turn + 1) + "'s Turn",1600,800 * turn + 400);
    }
    
    lastTurn = turn;
}



