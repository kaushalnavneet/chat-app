const users = []

const addUser = ({ id, username, room }) => {
    // Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }

    // Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    // Validate username
    if (existingUser) {
        return {
            error: 'Username already exists!'
        }
    }

    // Store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUserInRoom = (room) => {
    room = room.trim().toLowerCase()
    /*
        const usersInRoom = []
        users.forEach((user) => {
            if (user.room === room) {         
                usersInRoom.push(user)
            }
        })
        return usersInRoom
    */
   return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUserInRoom
}

/*
addUser({
    id: 22,
    username: 'NAvneet',
    room: 'Pune'
})

addUser({
    id: 21,
    username: 'Vith',
    room: 'Pune'
})

addUser({
    id: 23,
    username: 'Shi',
    room: 'Goa'
})

//console.log(getUser(211))
console.log(getUserInRoom('Pune'))
*/
