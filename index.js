let canvas = document.getElementById('road'),
    context = canvas.getContext('2d');
let brickInterval, latestBrickLevel = 0;
const width = canvas.width, height = canvas.height, noOfLanes = 4;
const car = {
    img: document.createElement("img"),
    width: 0,
    height: 0,
    position: {
        x: 25,
        y: height - 25
    }
},
    brick = {
        img: document.createElement('img'),
        width: 0,
        height: 0,
        position: {
            x: 25,
            y: 25
        }
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
    blocklanes();
    console.log(width, height, car.width, car.height, brick.width, brick.height);
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'Right' || event.key === 'ArrowRight') {
        if (car.position.x + 100 < width) {
            car.position.x += 100;
            draw();
        }
        console.log('right key');
    } else if (event.key === 'Left' || event.key === 'ArrowLeft') {
        if (car.position.x - 100 > 0) {
            car.position.x -= 100;
            draw();
        }
        console.log('left key');
    }
});

function draw() {
    context.clearRect(0, 0, width, height);
    drawCar();
    drawBricks();
}
function drawCar() {
    context.drawImage(car.img, car.position.x, car.position.y, car.width, car.height);
}
function drawBricks() {
    for (let lane of lanes) {
        for (let block of lane) {
            let levelDiff = latestBrickLevel - block.brickLevel,
                blockY = levelDiff === 0 ? 25 : levelDiff * (car.height + brick.width) + 25;
            if (blockY < height) {
                context.drawImage(brick.img, block.x, blockY, brick.width, brick.height);
            }
        }
    }
}
function blocklanes() {
    brickInterval = window.setInterval(() => {
        let laneIndex = Math.floor(Math.random() * noOfLanes),
            lane = lanes[laneIndex];
        lanes[laneIndex].push({
            x: lane[lane.length - 1] ? lane[lane.length - 1].x : laneIndex * 100 + 25,
            brickLevel: ++latestBrickLevel
        });
        draw();
    }, 1000);
}

document.querySelector('button').addEventListener('click', () => {
    window.clearInterval(brickInterval);
});