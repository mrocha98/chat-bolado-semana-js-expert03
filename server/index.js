import Event from 'events'

import { SocketServer } from './src/socket.js'
import { constants } from './src/constants.js'
import { Controller } from './src/controller.js'

const eventEmmiter = new Event()

const port = process.env.PORT || 9898
const socketServer = new SocketServer({ port })
const server = await socketServer.initialize(eventEmmiter)
console.log('socket server running at', server.address().port)
const controller = new Controller({ socketServer })
eventEmmiter.on(
  constants.event.NEW_USER_CONNECTED,
  controller.onNewConnection.bind(controller)
)
// eventEmmiter.on(constants.event.NEW_USER_CONNECTED, socket => {
//   console.log('new connection!!', socket.id)
//   socket.on('data', data => {
//     console.log('server received', data.toString())
//     socket.write('PIMBA')
//   })
// })
