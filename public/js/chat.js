const socket = io()
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')

// Templates
const $messageTemplate = document.querySelector('#message-template').innerHTML
const $locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true})


// Cmd + / (multiline comment)
// socket.on('countUpdate', (count) => {
//     console.log('The count has been updated', count)
// })

// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('Clicked')
//     socket.emit('increment')
// })

const autoscroll = () => {
    // the if condition is added just to not autoscroll to the bottom in the case of new message comming
    // but the user is reading some message above

    // New message element 
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight    // use just this line in this fn if we want to alway scroll to the bottom
    }

} 

socket.on('message', (message) => {
    //console.log(msg)
    const html = Mustache.render($messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (message) => {
    const html = Mustache.render($locationMessageTemplate, {
        username: message.username,
        url: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render($sidebarTemplate, {
        room,
        users
    })
    $sidebar.innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    
    $messageFormButton.setAttribute('disabled', 'disabled') // disable the button

    // const message = document.querySelector('input').value
    const message = e.target.elements.inpMsg.value
    socket.emit('sendMessage', message, (msg) => {

        $messageFormButton.removeAttribute('disabled') // enable the button
        $messageFormInput.value = ''
        $messageFormInput.focus()
        console.log('The message was delivered!', msg)  // Event acknowledgement
    })

    // socket.emit('sendMessage', message, (error) => {
    //     if (error) {
    //         return console.log(error)   // to check the profanity
    //     }
    //     console.log('Message delivered!')
    // })

})

$locationButton.addEventListener('click', () => {
    $locationButton.setAttribute('disabled', 'disabled')
    if(!navigator.geolocation) {
        return alert('Geolocation API not supported by your browser!')
    }

    navigator.geolocation.getCurrentPosition((position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const location = { latitude, longitude };
        socket.emit('sendLocation', location, () => {
            $locationButton.removeAttribute('disabled')
            console.log('Location shared!')
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'     // send back to join page if the same username and room is joining
    }
})