const socket = io()

const $messageForm = document.querySelector('#message-form')
const $messageFormButton = $messageForm.querySelector('#send-message')
const $messageFormInput = $messageForm.querySelector('#message')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

const messageTemp = document.querySelector('#message-temp').innerHTML
const locationTemp = document.querySelector('#location-message-temp').innerHTML
const sidebarTemp = document.querySelector('#sidebar-template').innerHTML

const {username, room}= Qs.parse(location.search,{ignoreQueryPrefix: true})

socket.on('sendtoC',(output)=>{
    console.log(output)
    const html = Mustache.render(messageTemp,{
        username: output.username,
        message: output.text,
        createdAT: moment(output.createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend',html)
})

socket.on('sendLocation',(url)=>{
    console.log(url)
     const html = Mustache.render(locationTemp,{
        username: url.username,
        url: url.text,
        createdAT: moment(url.createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend',html)
})

socket.on('roomData',({room,users})=>{
    const html = Mustache.render(sidebarTemp,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML =html
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    $messageFormButton.setAttribute('disabled','disabled')
    
    const message = e.target.elements.message.value
    socket.emit('sendtoS',message,(message)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=""
        $messageFormInput.focus()
        console.log('message sent',message)
    })
})

document.querySelector('#send-location').addEventListener('click',()=>{
    $sendLocationButton.setAttribute('disabled','disabled')
    if (!navigator.geolocation){
        $sendLocationButton.removeAttribute('disabled')
        return alert('Geolocation not supported')
    }
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation',{
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        },(response)=>{
            console.log(response)
            $sendLocationButton.removeAttribute('disabled')
        })
    })
})

socket.emit('join', {username, room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})
