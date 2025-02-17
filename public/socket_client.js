/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const form = document.getElementById('form-message')
const input = document.getElementById('input-message')
const messages = document.getElementById('messages')

const getUsername = async () => {
  let username = localStorage.getItem('username')
  if (username) {
    console.log('Username exists in localStorage')
  } else {
    const response = await fetch('https://random-data-api.com/api/v2/users')
    const { username: randomUser } = await response.json() // con username: randomUser se extrae el valor de la propiedad username y se cambia el nombre a randomUser
    username = randomUser
    localStorage.setItem('username', username)
  }
  return username
}

function createMessage (msgData, className) {
  const { user, content } = msgData
  const item = `<li class="${className}">
                  <p>${content}</p>
                  <small>${user}</small>
                </li>`
  messages.insertAdjacentHTML('beforeend', item)
}

const createTimer = (callback, delay) => {
  let timerId
  return {
    start: () => {
      timerId = setTimeout(callback, delay)
    },
    stop: () => {
      clearTimeout(timerId)
    },
    reset: () => {
      clearTimeout(timerId)
      timerId = setTimeout(callback, delay)
    }
  }
}

const socket = io({
  auth: {
    username: await getUsername(),
    serverOffset: 0
  },
  ackTimeout: 10000,
  retries: 3 // number of retries before giving up
})

form.addEventListener('submit', (e) => {
  e.preventDefault()
  console.log('send message')

  socket.timeout(5000).emit('chat message', input.value, (err, response) => {
    if (err !== null) {
      console.error('error: ' + err)
    } else {
      console.log('response: ' + Object.entries(response))
      socket.auth.serverOffset = response.id

      createMessage({ user: socket.auth.username, content: input.value }, 'user-message')
      input.value = ''
      messages.scrollTop = messages.scrollHeight
    }
  })
})

let typing
const typingTimeout = 500
const timer = createTimer(() => {
  typing = false
  console.log('stopped typing')
  socket.emit('user stopped typing')
}, typingTimeout)

input.addEventListener('keypress', (e) => {
  if (!typing) {
    console.log('typing')
    socket.emit('user typing')
  }

  typing = true
  timer.reset()
})

socket.on('recovered', (users) => {
  const index = users.indexOf(socket.auth.username) // Delete the current user from the array
  if (index !== -1) {
    users.splice(index, 1)
  }

  console.log(users)
  let item
  if (users.length === 0) {
    item = '<li class="users-online"><small>no users online</small></li>'
  } else {
    if (users.length === 1) {
      item = `<li class="users-online">
      <small>${users[0]} is online</small>
      </li>`
    } else if (users.length < 5) {
      item = '<li class="users-online"><small>'
      for (let i = 0; i < users.length; i++) {
        if (i === users.length - 1) {
          item += `${users[i]}`
        } else {
          item += `${users[i]}, `
        }
      }
      item += ' are online</small></li>'
    } else {
      item = `<li class="users-online"><small>${users.length}+ users are online</small></li>`
    }
  }
  messages.insertAdjacentHTML('beforeend', item)
  messages.scrollTop = messages.scrollHeight
})

socket.on('chat message', (msgData) => {
  console.log('message received')
  console.log(msgData)

  let type = 'chat-message'
  if (msgData.user === socket.auth.username) {
    type = 'user-message'
  }
  createMessage(msgData, type)

  socket.auth.serverOffset = msgData.id
  messages.scrollTop = messages.scrollHeight
})

socket.on('user typing', (username) => {
  const item = `<li class="new-user">
                  <small>${username} is typing...</small>
                </li>`
  messages.insertAdjacentHTML('beforeend', item)
  messages.scrollTop = messages.scrollHeight
})

socket.on('user stopped typing', () => {
  const typingMessages = document.querySelectorAll('.new-user')
  typingMessages[typingMessages.length - 1].remove()
})

socket.on('new user', (username) => {
  const item = `<li class="new-user">
                  <small>${username} has connected</small>
                </li>`
  messages.insertAdjacentHTML('beforeend', item)
  messages.scrollTop = messages.scrollHeight
})

socket.on('user disconnected', (username) => {
  const item = `<li class="new-user">
    <small>${username} has disconnected</small>
  </li>`
  messages.insertAdjacentHTML('beforeend', item)
  messages.scrollTop = messages.scrollHeight
})
