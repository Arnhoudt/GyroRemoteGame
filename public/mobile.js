let socket
let re
function handleOrientation(event) {
    socket.emit('message', JSON.stringify({re: re, a: event.alpha, b: event.beta}))
    updateFieldIfNotNull('Orientation_a', event.alpha)
    updateFieldIfNotNull('Orientation_b', event.beta)
}

function updateFieldIfNotNull(fieldName, value, precision=10){
    if (value != null)
    document.getElementById(fieldName).innerHTML = value.toFixed(precision)
}

document.querySelector("#connectToPc").addEventListener("click", ()=>{
    document.querySelector("#connectToPc_menu").classList.add("hidden")
    document.querySelector("#permission_menu").classList.remove("hidden")
    re = document.querySelector("#re").value
    socket = io.connect('/')
})

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

const $fire = document.querySelector("#fire")
$fire.addEventListener('click', ()=>{
    console.log("sending fire")
    socket.emit('fire', 'fire')
})