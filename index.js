const isDevelopment = true
const { Certificate } = require('crypto')
const express = require('express')
const app = express()
const fs = require('fs')

let options = {}
if(isDevelopment){
    options = {
        key: fs.readFileSync('./localhost.key'),
        cert: fs.readFileSync('./localhost.crt')
    }
}

const server = require(isDevelopment?'https':'http').Server(options, app)
const port = process.env.PORT || 3000

const io = require('socket.io')(server);
let connectedSockets = {}


app.use(express.static('./public'))

io.on('connection', socket =>{
    socket.on('message', message => {
        re = JSON.parse(message)["re"].toUpperCase()
        if(re in connectedSockets){
            connectedSockets[re].emit('message', message)
        }else{
            console.log("socket not found")
        }
    })
    socket.on('fire', message => {
        connectedSockets[re].emit('fire', message)
    })
    socket.on('disconnect', socket =>{
        delete connectedSockets[socket.id]
    })
    console.log(socket.id.substring(0, 5))
    connectedSockets[socket.id.substring(0, 5).toUpperCase()] = socket
    // console.log(connectedSockets)
})


server.listen(port, ()=>{
    console.log(`Server is listening on port ${port}`)
})