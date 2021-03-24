import { ComponentsBuilder } from './components.js'
import { constants } from './constants.js'

const { app: appConstants } = constants.events

export class TerminalController {
  #usersColors = new Map()

  constructor () {}

  #pickColor () {
    return `#${(((1 << 24) * Math.random()) | 0).toString(16)}-fg`
  }

  #getUserColor (userName) {
    if (this.#usersColors.has(userName)) return this.#usersColors.get(userName)

    const color = this.#pickColor()
    this.#usersColors.set(userName, color)

    return color
  }

  #onInputReceived (eventEmmiter) {
    return function () {
      const message = this.getValue()
      console.log({ message })
      this.clearValue()
    }
  }

  #onMessageReceived ({ screen, chat }) {
    return msg => {
      const { userName, message } = msg
      const color = this.#getUserColor(userName)

      chat.addItem(`{${color}}{bold}${userName}{/}: ${message}`)

      screen.render()
    }
  }

  #onLogChanged ({ screen, activityLog }) {
    return msg => {
      const [userName] = msg.split(/\s/)
      const color = this.#getUserColor(userName)
      activityLog.addItem(`{${color}}{bold}${msg.toString()}{/}`)

      screen.render()
    }
  }

  #onStatusChanged ({ screen, status }) {
    return users => {
      const { content: title } = status.items.shift()
      status.clearItems()
      status.addItem(title)

      users.forEach(userName => {
        const color = this.#getUserColor(userName)
        status.addItem(`{${color}}{bold}${userName}{/}`)
      })

      screen.render()
    }
  }

  #registerEvents (eventEmmiter, components) {
    eventEmmiter.on(
      appConstants.MESSAGE_RECEIVED,
      this.#onMessageReceived(components)
    )
    eventEmmiter.on(
      appConstants.ACTIVITYLOG_UPDATED,
      this.#onLogChanged(components)
    )
    eventEmmiter.on(
      appConstants.STATUS_UPDATED,
      this.#onStatusChanged(components)
    )
  }

  async initializeTable (eventEmmiter) {
    const components = new ComponentsBuilder()
      .setScreen({ title: 'HackerChat - Mendigo' })
      .setLayoutComponent()
      .setInputComponent(this.#onInputReceived(eventEmmiter))
      .setChatComponent()
      .setActivityLogComponent()
      .setStatusComponent()
      .build()

    this.#registerEvents(eventEmmiter, components)

    components.input.focus()
    components.screen.render()
  }
}
