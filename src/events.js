/* @flow */
import mitt from 'mitt'

import { error, warning, raise } from './logger'
import { LISTENER, SCROLL } from './constants'
import { validate } from './browser'
import type { EventType, CustomError } from './types'

type Handler = MouseEventHandler

export default class Events {
  mitt: mitt
  name: string
  observer: any
  type: EventType
  constructor (emitName: string, eventEmitter: mitt, eventObserver: any): void {
    this.name = emitName
    this.mitt = eventEmitter
    this.observer = eventObserver
  }
  error (err: CustomError): void {
    error(err)
  }
  warning (err: CustomError): void {
    warning(err)
  }
  validate (): boolean {
    raise('please override validate')
    return false
  }
  emit (data: {x: number, y: number}): void {
    if (data.x < 0 || data.y < 0 || !this.type) {
      return
    }

    this.mitt.emit(this.name, Object.assign({}, data, {
      type: this.type,
      left: window.scrollX,
      top: window.scrollY
    }))
  }
  on (target: HTMLElement | window, eventName: EventType, handler: Handler): void {
    if (!target || typeof handler !== 'function') {
      raise('please override on')
      return
    }

    if (!this.validate() || !validate(LISTENER.concat(SCROLL))) {
      return
    }

    this.observer.subscribe(target, eventName, e => {
      try {
        handler(e)
      } catch (err) {
        error(err)
      }
    })
    this.type = eventName
  }
  off (): void {
    this.observer.unsubscribeAll()
  }
}
