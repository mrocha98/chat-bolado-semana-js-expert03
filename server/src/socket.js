import http from 'http'
import status from 'http-status'
import { v4 as uuid } from 'uuid'

import { constants } from './constants.js'

export class SocketServer {
  constructor ({ port }) {
    this.port = port
  }

  async initialize (eventEmmiter) {
    const server = http.createServer((_, res) => {
      res.writeHead(status.OK, { 'Content-Type': 'text/plain' })
      res.end('salve pra firma!!')
    })

    server.on('upgrade', (req, socket) => {
      socket.id = uuid()
      const headers = [
        'HTTP/1.1 101 Web Socket Protocol Handshake',
        'Upgrade: WebSocket',
        'Connection: Upgrade',
        ''
      ]
        .map(line => line.concat('\r\n'))
        .join('')

      socket.write(headers)
      eventEmmiter.emit(constants.event.NEW_USER_CONNECTED, socket)
    })

    return new Promise((resolve, reject) => {
      server.on('error', reject)
      server.listen(this.port, () => resolve(server))
    })
  }
}
