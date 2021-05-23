const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const {generateMessage, generateLocationMessage} = require('./utils/message-data.js')
const {addUser, removeUser, getUser, getUsersinRoom} = require('./utils/user-data.js')

const app = express()
const server = http.createServer(app)
const publicDirPath = path.join(__dirname,'../public')
const port =process.env.PORT || 3000
const io = socketio(server)
app.use(express.static(publicDirPath))

io.on('connection',(socket)=>{
    console.log('New Websocket Conection')


    socket.on('join', ({username, room},callback)=>{
        const {error,user}=addUser({id:socket.id, username, room})
        if(error){
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('sendtoC', generateMessage('Admin','welcome'))
        socket.broadcast.to(room).emit('sendtoC',generateMessage('Admin', `${user.username} Has Joined`))
        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUsersinRoom(user.room)
        })
        callback()
    })
    
    socket.on('sendtoS',(input,callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('sendtoC',generateMessage(user.username,input))
        callback('Delivered')
    })


    socket.on('disconnect',()=>{
        const user=removeUser(socket.id)
        if(user){
            io.to(user.room).emit('sendtoC',generateMessage('Admin',`${user.username} has left`))
            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getUsersinRoom(user.room)
            })
        }
    })

    socket.on('sendLocation',(input,callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('sendLocation',generateLocationMessage(user.username,`https://www.google.com/maps/@${input.latitude},${input.longitude}`))
        callback('location sent')
    })
})

server.listen(port, ()=>{
    console.log('server is up on port: ' + port)
})