{
    //Settings
    const BACKGROUND_COLOR = "#241842"
    const POINTER_COLOR = "#FF5465"
    const SCORE_COLOR = "#00FF00"

    const socket = io.connect('/');

    // canvas setup
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    let devicePixelRatio = window.devicePixelRatio
    let clientWidth = window.innerWidth
    let clientheight = window.innerHeight
    canvas.width = clientWidth
    canvas.height = clientheight
    ctx.scale(devicePixelRatio, devicePixelRatio)
    ctx.font = "20px Arial";
    ctx.textAlign = "center";

    
    //variables
    let orientation = {a:0,b:0}
    let calibration = {a:0,b:0}
    let x_multip = 20
    let y_multip = 20
    let hasFired = false
    let fireIndex=0
    let gameActive = false
    let gameOver = false
    let gameEntities = []
    let startTimestamp //stores the timestamp (ms) when the game started
    let previousCubeSpawned = -200000

    const calibrateCenter = () =>{
        calibration.a = orientation.a,
        calibration.b = orientation.b
        document.querySelector("#canvas").classList.remove("hidden")
        document.querySelector("#calibration_menu").classList.add("hidden")
        gameActive = true
        startTimestamp = Date.now()
    }

    const executeFire = () =>{
        console.log("executeFire")
        gameEntities.forEach(gameEntity => {
            if(gameEntity.isHit()){
                console.log("remove entity")
            }
        })
    }

    const fireMap = {//the fire map allows for a more accurate calibration
        0:calibrateCenter,
        1:executeFire,
    }

    const differenceElapse360 = difference => {
        if (Math.abs(difference) < 270)
            return difference
        if (difference < 0)
            return 360 + difference
        return difference - 360
    }

    socket.on("message", (arg) => {
        newOrientation = JSON.parse(arg)
        orientation.a -= differenceElapse360(orientation.a - newOrientation.a)
        orientation.b -= differenceElapse360(orientation.b - newOrientation.b)
    });

    socket.on("fire", (arg) => {
        hasFired = true
    });

    const randomIntFromInterval = (min, max) => { // stackOverflow random functie
        return Math.floor(Math.random() * (max - min + 1) + min)
    }

    const cubeCalculateState = (cube, time) => {
        cube.value = Math.round((cube.startTime + cube.activeTime - time)/100)/10
        return cube.value <= 0
    }

    const cubeDraw = (cube, ctx) => {
        ctx.strokeStyle = POINTER_COLOR
        ctx.fillStyle = POINTER_COLOR
        ctx.beginPath();
        ctx.rect(cube.pos[0], cube.pos[1], 60, 60);
        ctx.stroke();
        ctx.fillText(cube.value, cube.pos[0] + 30, cube.pos[1] + 38);
    }

    const createCube = (startTime, activeTime) =>{
        cube = {
            startTime: startTime,
            activeTime: activeTime,
            value: activeTime/1000,
            pos: [
                randomIntFromInterval(0, clientWidth/devicePixelRatio - 60),
                randomIntFromInterval(0, clientheight/devicePixelRatio - 60)
            ],
            calculateState: cubeCalculateState,
            draw: cubeDraw
        }
        return cube
    }

    const run = () => { // wil execute every time the browser is able to update the screen
        if(hasFired){ 
            fireMap[fireIndex]();
            if( fireIndex + 1 in fireMap ) // progress if and only if there is a next step
                fireIndex++
            hasFired = false
        }
        if(gameActive){
            let time = Date.now() - startTimestamp
            gameEntities.forEach(gameEntity => {
                gameOverSignal = gameEntity.calculateState(gameEntity, time)
                if(gameOverSignal){
                    gameActive = false
                    gameOver = true
                }
            })
            if(time > previousCubeSpawned + 5000){
                const cube = createCube(time, 10000)
                gameEntities.push(cube)
                previousCubeSpawned = time
            }
        }
    }

    const draw = () => {
        ctx.fillStyle = BACKGROUND_COLOR
        ctx.fillRect(0,0, clientWidth, clientheight)
        console.log(gameEntities)
        gameEntities.forEach(gameEntity => {
            gameEntity.draw(gameEntity, ctx)
        })
        ctx.strokeStyle = POINTER_COLOR
        ctx.beginPath();
        ctx.ellipse((calibration.a - orientation.a) * x_multip + clientWidth / 2 / devicePixelRatio,
        (calibration.b - orientation.b) * y_multip + clientheight / 2 / devicePixelRatio,
        15, 15, 0, 0, 2*Math.PI)
        ctx.stroke();
    }

    const runWrapper = () => {
        run()
        draw()
        requestAnimationFrame(runWrapper)
    }
    requestAnimationFrame(runWrapper)

}