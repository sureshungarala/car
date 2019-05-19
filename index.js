let canvas = document.getElementById('road'),
    context = canvas.getContext('2d');
let brickInterval, latestBrickLevel = 0, initBrickMargin = 0, score = 0;
let pauseInterval = false, gameLost = false;
const width = canvas.width, height = canvas.height, noOfLanes = 4, carMargin = 25, carPadding = 5;
const car = {
    img: document.createElement("img"),
    width: 0,
    height: 0,
    position: {
        x: carMargin,
        y: height - carMargin
    }
},
    brick = {
        img: document.createElement('img'),
        width: 0,
        height: 0
    };
car.img.src = 'assets/car.png';
brick.img.src = 'assets/brick.png';
let lanes = [
    [], [], [], []
];
window.onload = function () {
    car.width = car.img.width / 2;
    car.height = car.img.height / 2;
    car.position.y -= car.height;
    drawCar();
    brick.width = car.width;
    brick.height = car.width;
    let jumpPixels = (height - carMargin - carPadding) / (car.height + brick.height);
    initBrickMargin = (car.height + brick.height) * (jumpPixels - Math.floor(jumpPixels));
    blocklanes();
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'Right' || event.key === 'ArrowRight') {
        if (car.position.x + 100 < width) {
            pauseInterval = true;
            car.position.x += 100;
            draw();
            pauseInterval = false;
        }
        console.log('right key');
    } else if (event.key === 'Left' || event.key === 'ArrowLeft') {
        if (car.position.x - 100 > 0) {
            pauseInterval = true;
            car.position.x -= 100;
            draw();
            pauseInterval = false;
        }
        console.log('left key');
    } else if (gameLost && (event.key === ' ' || event.code === 'Space')) {
        document.location.reload();
    }
});

function draw() {
    context.clearRect(0, 0, width, height);
    drawCar();
    drawBricks();
    drawScore();
}
function drawCar() {
    context.drawImage(car.img, car.position.x, car.position.y, car.width, car.height);
}
function drawBricks() {
    for (let lane of lanes) {
        for (let block of lane) {
            let blockY = (latestBrickLevel - block.brickLevel) * (car.height + brick.height) + initBrickMargin;
            if (blockY < height) {
                blockY = (blockY > car.position.y && blockY + 2 * carPadding < height) ? blockY + 2 * carPadding : blockY;
                if (blockY > car.position.y + car.height && !pauseInterval) {
                    score++;
                    if (block.x === car.position.x) {
                        gameLost = true;
                        cancelInterval();
                        alert('GAME OVER!');
                    }
                }
                context.drawImage(brick.img, block.x, blockY, brick.width, brick.height);
            }
        }
    }
}
function drawScore() {
    context.font = '18px sans-serif';
    context.fillStyle = '#ffffff';
    context.fillText('Score: ' + score, 310, 25);
}
function blocklanes() {
    brickInterval = window.setInterval(() => {
        if (!pauseInterval) {
            let laneIndex = Math.floor(Math.random() * noOfLanes),
                lane = lanes[laneIndex];
            lanes[laneIndex].unshift({
                x: lane[lane.length - 1] ? lane[lane.length - 1].x : laneIndex * 100 + carMargin,
                brickLevel: ++latestBrickLevel
            });
            draw();
        }
    }, 1000);
}
function cancelInterval() {
    window.clearInterval(brickInterval);
}
document.querySelector('button').addEventListener('click', () => {
    cancelInterval();
});