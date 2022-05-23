const isDevelopment = true
const { Certificate } = require('crypto')
const express = require('express')
const app = express()
const fs = require('fs')

let options = {}
if(isDevelopment || process.env.DEVELOPMENT){
    options = {
        key: fs.readFileSync('./localhost.key'),
        cert: fs.readFileSync('./localhost.crt')
    }
}


const server = require(isDevelopment?'https':'http').Server(options, app)
const port = process.env.PORT || 3000

const io = require('socket.io')(server);
let connectedSockets = {}
let reverseConnections = {}

app.use(express.static('./public'))


io.on('connection', socket =>{
    socket.on('testConnection', message =>{
        try{
            re = message.toUpperCase()
            reverseConnections[re] = socket
            socket.emit('textConnection', re in connectedSockets)
        }catch (error){
            console.log(error)
        }
    })
    socket.on('message', message => {
        console.log(message)
        try{
            re = JSON.parse(message)["re"].toUpperCase()
            if(re in connectedSockets){
                connectedSockets[re].emit('message', message)
            }else{
                socket.emit('error', "1") // error 1 socket not found
            }
        }catch (error){
            console.log(error)
        }
    })
    socket.on('fire', message => {
        try{
            re = JSON.parse(message)["re"].toUpperCase()
            if(re in connectedSockets){
                connectedSockets[re].emit('fire', message)
            }else{
                socket.emit('error', "1") // error 1 socket not found
            }
        }catch (error){
            console.log(error)
        }
        
    })
    socket.on('gameover', message => {
        try{
            re = JSON.parse(message)["re"].toUpperCase()
            reverseConnections[re].emit('gameover', true)
        }catch (error){
            console.log(error)
        }
    })

    socket.on('restart', message => {
        try{
            re = JSON.parse(message)["re"].toUpperCase()
            reverseConnections[re].emit('restart', true)
        }catch (error){
            console.log(error)
        }
    })
    socket.on('disconnect', message =>{
        try{
            const id = socket.id.replace(/[^\w]/gi, '').substring(0, 4).toUpperCase()
            delete connectedSockets[id]
        }catch (error){
            console.log(error)
        }
    })
    const id = socket.id.replace(/[^\w]/gi, '').substring(0, 4).toUpperCase()
    connectedSockets[id] = socket
})


server.listen(port, ()=>{
    console.log(`Server is listening on port ${port}`)
})