/* eslint-disable n/no-callback-literal */
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { join } from 'path'
import { pool } from './db'

const app = express()
// eslint-disable-next-line @typescript-eslint/no-misused-promises
const server = createServer(app)
const io = new Server(server)

const users: string[] = []

const staticPath = join(process.cwd(), 'public')
app.use(express.static(staticPath))
app.get('/', (_req, res) => {
  res.sendFile(join(staticPath, 'index.html'))
})

io.on('connection', async (socket) => {
  const username = socket.handshake.auth.username as unknown as string
  console.log('a user has connected')
  users.push(username)
  socket.broadcast.emit('new user', username) // Broadcast to all clients except the sender

  socket.on('disconnect', () => {
    console.log('a user has disconnected')
    const index = users.indexOf(username)
    if (index !== -1) {
      users.splice(index, 1)
    }
    socket.broadcast.emit('user disconnected', socket.handshake.auth.username) // Broadcast to all clients except the sender
  })

  socket.on('chat message', async (msg: string, callback) => {
    try {
      const client = await pool.connect()
      const result = await client.query('INSERT INTO messages ("user", content) VALUES ($1, $2) RETURNING *', [username, msg])
      client.release()

      const msgData = result.rows[0]

      socket.broadcast.emit('chat message', msgData) // Broadcast to all clients except the sender
      // eslint-disable-next-line n/no-callback-literal
      callback({ status: 'ok', id: msgData.id }) // Acknowledgement
    } catch (error) {
      callback(error)
      console.log(error)
    }
  })

  socket.on('user typing', (callback) => {
    socket.broadcast.emit('user typing', socket.handshake.auth.username) // Broadcast to all clients except the sender
    callback({ status: 'ok' }) // Acknowledgement
  })

  socket.on('user stopped typing', (callback) => {
    socket.broadcast.emit('user stopped typing', socket.handshake.auth.username) // Broadcast to all clients except the sender
    callback({ status: 'ok' }) // Acknowledgement
  })

  if (!socket.recovered) { // Send all missing messages to the client
    try {
      const lastMessageFromClient: number = socket.handshake.auth.serverOffset

      const client = await pool.connect()
      const result = await client.query('SELECT * FROM messages WHERE id > $1;', [lastMessageFromClient])

      result.rows.forEach((row) => {
        socket.emit('chat message', row)
      })
      socket.emit('recovered', users) // Acknowledgement
    } catch (error) {
      console.log(error)
    }
  }

  // socket.onAny((eventName: string, args: unknown) => { // To debug incoming events
  //   console.log(`received event: ${eventName}`)
  //   console.log(args)
  // })

  // socket.onAnyOutgoing((eventName: string, args: unknown) => { // To debug outgoing events
  //   console.log(`sending event: ${eventName}`)
  //   console.log(args)
  // })
})

server.listen(process.env.PORT, () => {
  console.log(`Server is running on port: ${process.env.PORT as unknown as number}`)
})
