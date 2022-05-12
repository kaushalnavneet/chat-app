const path = require('path')    // core node module, no need to install
const http = require('http')    // core node module
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUserInRoom } = require('./utils/users')

const app = express()

const server = http.createServer(app) // was not needed if we don't need socket.io, it's behaviour is same as express server

const io = socketio(server)     // Now the server supports websockets

const port = process.env.PORT || 5000

const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

//let count = 0
let welcomeMsg = 'Welcome!'


io.on('connection', (socket) => {
    console.log('New WebSocket connection')    // Need to load client side of the socket library 

    // socket.emit('countUpdate', count)

    // socket.on('increment', () => {
    //     count++
    //     // socket.emit('countUpdate', count)
    //     io.emit('countUpdate', count)   // will emit to all the clients
    // })

    // socket.emit('message', generateMessage(welcomeMsg))

    // socket.broadcast.emit('message', generateMessage('A new user has joined')) // broadcast to every user other than the user joining

    //socket.on('join', ({ username, room }, callback) => {
    socket.on('join', (options, callback) => {      // options = { username, room }
        const { error, user } = addUser({ id: socket.id, ...options })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage("Admin", welcomeMsg))

        socket.broadcast.to(user.room).emit('message', generateMessage(user.username, `${user.username} has joined!`)) // broadcast to every user other than the user joining

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUserInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)

        // const filter = new Filter()
        // if (filter.isProfane(message)) {
        //     return callback('Profanity is not allowed!')
        // }

        //io.emit('message', generateMessage(message))
        io.to(user.room).emit('message', generateMessage(user.username, message))
        
        callback('Delivered!');
    })
    
    socket.on('disconnect', () => { // broadcast to every user other than the user leaving
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage(user.username, `${user.username} has left!`)) 
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUserInRoom(user.room)
            })
        }
        
    })

    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id)
        // socket.broadcast.emit('message', `Location: ${location.latitude}, ${location.longitude}`)
        // socket.broadcast.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${location.latitude},${location.longitude}`))
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?q=${location.latitude},${location.longitude}`))
        callback();
    })


})

server.listen(port, () => {    // this callback is optional, only adding for log
    console.log(`Server is up on port: ${port}`)
})