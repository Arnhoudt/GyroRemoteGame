let socket
let re // will contain the id of the computer
let sendOrientation = true

const handleOrientation = (event) => {
    if(sendOrientation){
        socket.emit('message', JSON.stringify({re: re, a: event.alpha, b: event.beta}))
        updateFieldIfNotNull('Orientation_a', event.alpha)
        updateFieldIfNotNull('Orientation_b', event.beta)
    }
}

const updateFieldIfNotNull =(fieldName, value, precision=10) => {
    if (value != null)
    document.getElementById(fieldName).innerHTML = value.toFixed(precision)
}

const $fire = document.querySelector("#fire")
$fire.addEventListener('click', ()=>{
    socket.emit('fire', JSON.stringify({re: re}))
})

const connect = async code => {
    if(getParameter("code")){
        console.log(code == getParameter("code"))
    }
    console.log(typeof(code))
    console.log(code)
    socket = io.connect('/')
    socket.emit('testConnection', code.toString())
    socket.on('textConnection', result =>{
        if(result){
            document.querySelector("#connectToPc_menu").classList.add("hidden")
            document.querySelector("#permission_menu").classList.remove("hidden")
            socket.on('error', message => {
                console.log(message)
                if(message == "1"){
                    location.reload()
                }
            });
        }else{
            document.querySelector("#connectToPc_error").textContent = "Please enter a valid code"
            document.querySelector("#connectToPc_error").classList.remove("hidden")
        }
    })
    socket.on('gameover', result =>{
        console.log("gameOver")
        sendOrientation = false
    })
    socket.on('restart', result =>{
        console.log("restart")
        sendOrientation = true
    })
}

const getParameter = (key) => {
  
    // Address of the current window
    address = window.location.search
  
    // Returns a URLSearchParams object instance
    parameterList = new URLSearchParams(address)
  
    // Returning the respected value associated
    // with the provided key
    return parameterList.get(key)
}

if(getParameter("code")){
    document.querySelector("#re").value = getParameter("code")
}

//when a code is entered the next menu screen is shown
document.querySelector("#connectToPc").addEventListener("click", ()=>{
    re = document.querySelector("#re").value
    connect(re)
})
//when the user accepts device motion permission the menu hiddes
document.querySelector("#permission").addEventListener("click", ()=>{
    if (
    DeviceMotionEvent &&
    typeof DeviceMotionEvent.requestPermission === "function"
    ) {
    DeviceMotionEvent.requestPermission()
    }
    window.addEventListener("deviceorientation", handleOrientation)
    document.querySelector("#permission_menu").classList.add("hidden")
    document.querySelector("#fire").classList.remove("hidden")
})