{
    //Settings
    const BACKGROUND_COLOR = "#241842"
    const POINTER_COLOR = "#FF5465"
    const SCORE_COLOR = "#00FF00"
    const CUBE_SIZE = 60
    const ARROW_RADIUS_SIZE = 15

    const socket = io.connect('/');

    socket.on('connect', function() {
        document.querySelector("#desktop_id").textContent = socket.id.replace(/[^\w]/gi, '').substring(0,1).toUpperCase()
    });

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
    let previousCubeSpawned = 2000 //the game starts with a 2 sec delay
    let score = 0
    let gameLoopInterrupt = false

    let keyMap

    const init = () => {
        document.querySelectorAll(".restart")
        .forEach($element =>{$element.addEventListener("click", restart)})
        document.querySelectorAll(".recalibrate")
        .forEach($element =>{$element.addEventListener("click", recalibrate)})
        keyMap = {
            'r': restart,
            'c': recalibrate
        }
        window.addEventListener('keypress', e => {
            if(e.key in keyMap){
                keyMap[e.key]()
            }
        })
        document.querySelector("#sensitivity_range").addEventListener('change',e=>{
            document.querySelector("#sensitivity_label").textContent = y_multip = x_multip = e.target.value
        })
        requestAnimationFrame(runWrapper)
    }

    const restart = ()=> {
        showView(2)
        gameOver = false
        gameActive = true
        previousCubeSpawned = 2000
        score = 0
        startTimestamp = Date.now()
        document.querySelector("#message").classList.remove("fade_away")
        document.querySelector("#message").classList.add("fade_in")
        
        setTimeout(()=>{
            document.querySelector("#message").classList.add("fade_away")
            document.querySelector("#message").classList.remove("fade_in")
        }, 2000)
        document.querySelector("#score").textContent = "score: 0"
        gameEntities = []
    }

    const recalibrate = () => {
        gameActive = false // stops new entities spawning while calibrating
        gameEntities = [] // removes the background entities
        showView(0)
        fireIndex = 0
    }

    const updateScore = score => {
        document.querySelector("#score").textContent = "score: " + score
    }

    const calibrateCenter = () =>{
        calibration.a = orientation.a
        calibration.b = orientation.b
        showView(1)
    }

    const calibrateSensitivity = () =>{
        showView(2)
        restart()
    }

    const showView = index => {
        document.querySelectorAll(".view").forEach($view =>{
            if(!$view.classList.contains("hidden")){
                $view.classList.add("hidden")
            }
        })
        document.querySelectorAll(`.view${index}`).forEach($view =>{
            if($view.classList.contains("hidden")){
                $view.classList.remove("hidden")
            }
        })
    }

    const executeFire = () =>{
        gameEntities.forEach((gameEntity, index, obj) => {
            if(gameEntity.isHit(
                gameEntity,
                (calibration.a - orientation.a) * x_multip + clientWidth / 2 / devicePixelRatio,
                (calibration.b - orientation.b) * y_multip + clientheight / 2 / devicePixelRatio,
            )){
                obj.splice(index, 1);
                score ++
                updateScore(score)
            }
        })
    }

    const fireMap = {//the fire map allows for a more accurate calibration in future implementation
        0:calibrateCenter,
        1:calibrateSensitivity,
        2:executeFire
    }

    const differenceElapse360 = difference => {
        if (Math.abs(difference) < 270) //90 deg margen of error
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

    const cubeIsHit = (cube, x, y) => {
        return x >= cube.pos[0] - ARROW_RADIUS_SIZE &&
        x <= cube.pos[0] + CUBE_SIZE + ARROW_RADIUS_SIZE &&
        y >= cube.pos[1] - ARROW_RADIUS_SIZE &&
        y < cube.pos[1] + CUBE_SIZE + ARROW_RADIUS_SIZE
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
        return {
            startTime: startTime,
            activeTime: activeTime,
            value: activeTime/1000,
            pos: [
                randomIntFromInterval(0, clientWidth/devicePixelRatio - 60),
                randomIntFromInterval(0, clientheight/devicePixelRatio - 60)
            ],
            calculateState: cubeCalculateState,
            draw: cubeDraw,
            isHit: cubeIsHit
        }
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
                    document.querySelector("#gameover_score").textContent = score
                    showView(3)
                }
            })
            if(time > previousCubeSpawned + (1000 - time/100)){
                const cube = createCube(time, 10000)
                gameEntities.push(cube)
                previousCubeSpawned = time
            }
        }
    }

    const draw = () => {
        ctx.fillStyle = BACKGROUND_COLOR
        ctx.fillRect(0,0, clientWidth, clientheight)
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

    const fireGameloopInterrupt = () => {
        gameLoopInterrupt = true
    }

    const continueGameLoop = () => {
        gameLoopInterrupt = false
        requestAnimationFrame(runWrapper)
    }

    const runWrapper = () => {
        run()
        draw()
        if(!gameLoopInterrupt)
            requestAnimationFrame(runWrapper)
    }

    init()
}