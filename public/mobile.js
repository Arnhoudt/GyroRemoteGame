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
    socket.emit('fire', 'fire')
})

//when a code is entered the next menu screen is shown
document.querySelector("#connectToPc").addEventListener("click", ()=>{
    document.querySelector("#connectToPc_menu").classList.add("hidden")
    document.querySelector("#permission_menu").classList.remove("hidden")
    re = document.querySelector("#re").value
    socket = io.connect('/')
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