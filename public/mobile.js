let socket
let re // will contain the id of the computer

const handleOrientation = (event) => {
    socket.emit('message', JSON.stringify({re: re, a: event.alpha, b: event.beta}))
    updateFieldIfNotNull('Orientation_a', event.alpha)
    updateFieldIfNotNull('Orientation_b', event.beta)
}

const updateFieldIfNotNull =(fieldName, value, precision=10) => {
    if (value != null)
    document.getElementById(fieldName).innerHTML = value.toFixed(precision)
}

const $fire = document.querySelector("#fire")
$fire.addEventListener('click', ()=>{
    socket.emit('fire', JSON.stringify({re: re}))
})

//when a code is entered the next menu screen is shown
document.querySelector("#connectToPc").addEventListener("click", async ()=>{
    socket = io.connect('/')
    re = document.querySelector("#re").value
    socket.emit('testConnection', re.toString())
    socket.on('textConnection', result =>{
        if(result){
            document.querySelector("#connectToPc_menu").classList.add("hidden")
            document.querySelector("#permission_menu").classList.remove("hidden")
            socket.on('error', message => {
                if(message == "1"){
                    location.reload()
                }
            });
        }else{
            document.querySelector("#connectToPc_error").textContent = "Please enter a valid code"
            document.querySelector("#connectToPc_error").classList.remove("hidden")
        }
    })
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