let canvas = document.getElementById('road'),
    context = canvas.getContext('2d'),
    starBlank = document.createElement("img"),
    starFilled = document.createElement("img");
canvas.height = window.innerHeight;
let brickInterval,  //interval at which, bricks fall randomly
    latestBrickLevel = 0,   //brick_level_counter to position bricks(vertically)
    initBrickMargin = 0,    //initial top margin for brick
    score = 0,  //game score
    brickFallInterval = 1000;   //interval at which bricks are thrown
let pauseInterval = false,  // handles pausing Interval on arrow keys
    gameLost = false;   //if game lost
const width = canvas.width, //canvas' width
    height = canvas.height, //canvas' height
    noOfLanes = 4, //fixed no. of lanes
    carMargin = 25, //assumed margin for car, since 400px is fixed
    carPadding = 5; //assumed padding between car and nearest brick inthe same lane

context.fillStyle = '#ffffff';  //setting text fill color
const car = {   //car init object
    img: document.createElement("img"),
    width: 0,
    height: 0,
    position: { //car init position
        x: carMargin,
        y: height - carMargin
    }
},
    brick = {   //brick init object
        img: document.createElement('img'),
        width: 0,
        height: 0
    };
car.img.src = 'assets/car.png';
brick.img.src = 'assets/brick.png';
starBlank.src = 'assets/star_white.png';
starFilled.src = 'assets/star_yellow.png';
let lanes = [   //bricks data in 4 lanes
    [], [], [], []
];
window.onload = function () {   //wait for images to get loaded
    car.width = car.img.width / 2;
    car.height = car.img.height / 2;
    car.position.y -= car.height;
    brick.width = car.width;    //setting brick width same as car'
    brick.height = car.width;
    let jumpPixels = (height - carMargin - carPadding) / (car.height + brick.height);   //calculating required pixels to jump vertically w.r.t canvas height
    initBrickMargin = (car.height + brick.height) * (jumpPixels - Math.floor(jumpPixels));  //setting initBrickMargin equal to left out jumpPixels
    blocklanes();   //start throwing bricks
}

document.addEventListener('keydown', (event) => {   //listening for arrow , enter and space keys
    if (event.key === 'Right' || event.key === 'ArrowRight') {
        if (car.position.x + 100 < width) { //move only if it is with in the canvas
            pauseInterval = true;
            car.position.x += 100;  //car' next X-position
            draw();
            pauseInterval = false;  //pausing bricks' rendering to avoid race condition.
        }
    } else if (event.key === 'Left' || event.key === 'ArrowLeft') { //move only if it is with in the canvas
        if (car.position.x - 100 > 0) {
            pauseInterval = true;
            car.position.x -= 100;
            draw();
            pauseInterval = false;
        }
    } else if (gameLost && (event.key === ' ' || event.code === 'Space' || event.key === 'Enter' || event.code === 'Enter')) {
        //reload only if game lost
        document.location.reload();
    }
});

function draw() {   //redraw canvas and it' components
    context.clearRect(0, 0, width, height); //clear canvas before redrawing
    drawCar();
    drawBricks();
    drawScore();
    showStarRating();
    //changing brickFallInterval to speedup the brick fall as scroe go up
    let tempBrickFallInterval = brickFallInterval;
    if(score < 20){
        brickFallInterval = 1000;
    }else if (score >= 20 && score < 30) {
        brickFallInterval = 900;
    } else if (score >= 30 && score < 40) {
        brickFallInterval = 800;
    } else if (score >= 40 && score < 50) {
        brickFallInterval = 700;
    } else if (score >= 50 && score < 60) {
        brickFallInterval = 600;
    } else {
        brickFallInterval = 500;
    }
    if (tempBrickFallInterval !== brickFallInterval) {
        cancelInterval();
        blocklanes();
    }
}
function drawCar() {    //draw car image on canvas
    context.drawImage(car.img, car.position.x, car.position.y, car.width, car.height);
}
function drawBricks() { //draw bricks on canvas w.r.to their positions
    for (let lane of lanes) {
        for (let block of lane) {
            //setting brick's Y position based on brickLevel(counter) value further avoiding unneccesary looping
            //adding `car.height`, as gamer should be able to move car between the bricks (inter lanes).
            //`blockY` represents Y-position for the brick
            let blockY = (latestBrickLevel - block.brickLevel) * (car.height + brick.height) + initBrickMargin;
            if (blockY < height) {  //only render if it is inside the canvas
                //retaining bottom padding for the car
                blockY = (blockY > car.position.y && blockY + 2 * carPadding < height) ? blockY + 2 * carPadding : blockY;
                //when brick hits(crosees) before gamer turns(arrow keys)
                if (blockY > car.position.y + car.height && !pauseInterval) {
                    if (block.x === car.position.x) {   //same lane...so, game lost
                        gameLost = true;
                        cancelInterval();
                        GameSummary();
                        //alert('GAME OVER!'); or return;
                    }
                    score++;
                }
                context.drawImage(brick.img, block.x, blockY, brick.width, brick.height);   //draw the brick
            } else {
                break;  // break the loop if current brick already passed canvas as, further bricks in this lane has greater `brickLevel` value ('unshift'ed in lane)
            }
        }
    }
}
function drawScore() {  //draw the score on canvas
    context.font = '20px sans-serif';
    context.fillText('Score: ' + score, 310, 25);
    context.fillText('Speed: '+ (1000-brickFallInterval) + ' units', 140, 25);  //shows speed in units(brickFallInterval)
}
function GameSummary() {    //If lost, draw summary message
    context.font = '18px sans-serif';
    context.fillText('Ouch!...Bad luck. Try Again :) with Space bar.', 20, height / 2);
    context.fillText('Reach for the STARS! on road.', 80, height / 2 + 20);
}
function blocklanes() { //throws brick in a random lane
    brickInterval = window.setInterval(() => {
        if (!pauseInterval) {
            let laneIndex = Math.floor(Math.random() * noOfLanes),  //selecting random lane
                lane = lanes[laneIndex];
            lanes[laneIndex].unshift({  //adding from the head to avoid looping whole array(excluding bricks which left canvas already)
                x: lane[lane.length - 1] ? lane[lane.length - 1].x : laneIndex * 100 + carMargin,   //aligning brick with car
                brickLevel: ++latestBrickLevel  //counter to track brickleve...later used in positioning them
            });
            draw();
        }
    }, brickFallInterval);

}

function showStarRating() { //shows rating based on score
    if (score < 20) {
        for (let i = 0; i < 5; i++) {
            context.drawImage(starBlank, 20 * i, 10, 25, 25);
        }
    } else if (score >= 20 && score < 30) {
        for (let i = 0; i < 5; i++) {
            context.drawImage(i > 0 ? starBlank : starFilled, 20 * i, 10, 25, 25);
        }
    } else if (score >= 30 && score < 40) {
        for (let i = 0; i < 5; i++) {
            context.drawImage(i > 1 ? starBlank : starFilled, 20 * i, 10, 25, 25);
        }
    } else if (score >= 40 && score < 50) {
        for (let i = 0; i < 5; i++) {
            context.drawImage(i > 2 ? starBlank : starFilled, 20 * i, 10, 25, 25);
        }
    } else if (score >= 50 && score < 60) {
        for (let i = 0; i < 5; i++) {
            context.drawImage(i > 3 ? starBlank : starFilled, 20 * i, 10, 25, 25);
        }
    } else {
        for (let i = 0; i < 5; i++) {
            context.drawImage(starFilled, 20 * i, 10, 25, 25);
        }
    }


}
function cancelInterval() { //stop interval when game is lost
    window.clearInterval(brickInterval);
}
document.querySelector('button').addEventListener('click', () => {  //for debugging
    cancelInterval();
});