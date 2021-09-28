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
        if(re in connectedSockets){
            connectedSockets[re].emit('fire', message)
        }else{
            console.log("socket not found")
        }
    })
    socket.on('disconnect', message =>{
        const id = socket.id.replace(/[^\w]/gi, '').substring(0, 1).toUpperCase()
        delete connectedSockets[id]
    })
    const id = socket.id.replace(/[^\w]/gi, '').substring(0, 1).toUpperCase()
    connectedSockets[id] = socket
})


server.listen(port, ()=>{
    console.log(`Server is listening on port ${port}`)
})