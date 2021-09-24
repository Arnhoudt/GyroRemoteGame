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


app.use(express.static('./public'))

io.on('connection', socket =>{
    console.log(`a user connected ${socket.PORT}`)
    socket.on('message', message => {
        io.sockets.emit('message', message)
    })
    socket.on('fire', message => {
        io.sockets.emit('fire', message)
    })
})


server.listen(port, ()=>{
    console.log(`Server is listening on port ${port}`)
})