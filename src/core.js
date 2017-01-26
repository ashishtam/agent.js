import mitt from 'mitt'
import cookies from 'js-cookie'
import { v4 as uuid } from 'uuid'

import Logger from './logger'
import Store from './store'
import { get } from './requests'
import { VERSION as v, INTERVAL } from './constants'
import type {
  ClientEnvironmentsData,
  Interact,
  Options,
  EventType,
  SendType,
  State
} from './types'

type Size = {
  h: number,
  w: number
}

const SIZE: Size = {
  h: 0,
  w: 0
}

const EMIT_NAME = 'POINT'

let baseUrl: string
let delay: number = Math.max(INTERVAL)
let emitter: mitt
let eventId: number = 1
let loadTime: number

let cache: {
  l: Interact,
  a: Interact
}

const interacts: Interact[] = []
const events: any[] = []

function cacheValidator (data: Object): boolean {
  if (data.x > 0 && data.y > 0 &&
    data.type && data.time > 0 &&
    typeof data.left === 'number' && typeof data.top === 'number') {
    return true
  }
  return false
}

function findOrCreateClientId (name: string): string {
  const c = cookies.get(name)
  if (c) {
    return c
  }
  return uuid().replace(/-/g, '')
}

function getIntervalTime (): number {
  if (INTERVAL.length) {
    delay = INTERVAL.shift()
  }
  return delay
}

function createInteractData (data: Interact): string {
  return `${data.type},${data.time},${data.x},${data.y},${data.left},${data.top}`
}

function getInteractTypes (eventName: EventType): string[] {
  const types = []
  switch (eventName) {
    case 'click':
      types.concat(['l', 'a'])
      break
  }
  return types
}

function updateInteractCache (data: Object): void {
  const interact: Object = Object.assign({}, data, {
    left: window.scrollX,
    time: Date.now(),
    top: window.scrollY
  })
  if (cacheValidator(interact)) {
    const types = getInteractTypes(data.type)
    types.forEach(type => {
      cache[type] = Object.assign({}, interact, {type})
    })
  }
}

function sendInteracts (): void {
  if (!cache) {
    return
  }
  // saved snapshot
  Object.keys(cache).forEach(key => {
    interacts.push(cache[key])
  })

  const query: string[] = []
  interacts.forEach(data => {
    query.push(`d=${createInteractData(data)}`)
  })

  // TODO validate query string

  get(`${baseUrl}/${loadTime}/interact/${eventId}.gif`, query)
  interacts.length = 0
  eventId++

  setTimeout(sendInteracts, getIntervalTime())
}

export default class Agent extends Store {
  logger: Logger
  loaded: boolean
  constructor (id: string, eventsClass: [], opt: Options): void {
    super()
    baseUrl = `${opt.baseUrl}/${id}/${findOrCreateClientId(opt.cookieName)}/`
    emitter = mitt()
    this.logger = new Logger(opt.Raven)
    eventsClass.forEach(Class => {
      events.push(new Class(EMIT_NAME, emitter, this.logger, [2000]))
    })
  }
  send (type: SendType): void {
    switch (type) {
      case 'pageview':
        const state: State = this.merge({
          type: 'env',
          data: ((windowSize: Size, resourceSize: Size, screenSize: Size): ClientEnvironmentsData => {
            return {
              v,
              sh: screenSize.h,
              sw: screenSize.w,
              wh: windowSize.h,
              ww: windowSize.w,
              h: resourceSize.h,
              w: resourceSize.w
            }
          })(this.getWindowSize(window), this.getResourceSize(document), this.getScreenSize(screen))
        })
        const query: string[] = []
        const data = Object.assign({}, state.env, state.custom)
        Object.keys(data).forEach(key => {
          query.push(`${key}=${encodeURIComponent(data[key])}`)
        })

        loadTime = Date.now()
        get(`${baseUrl}/${loadTime}/env.gif`, query)
        this.listen()
        this.loaded = true
        sendInteracts()
    }
  }
  destroy (): void {
    emitter.off('*', updateInteractCache)
    events.forEach(e => {
      e.unbind()
    })
  }
  listen (): void {
    if (!this.loaded) {
      return
    }
    emitter.on(EMIT_NAME, updateInteractCache)
    events.forEach(e => {
      e.bind()
    })
  }
  getWindowSize (w: {innerHeight: number, innerWidth: number}): Size {
    return {
      h: w.innerHeight,
      w: w.innerWidth
    }
  }
  getResourceSize ({ body }: Document): Size {
    if (!body) {
      return SIZE
    }
    return {
      h: body.clientHeight,
      w: body.clientWidth
    }
  }
  getScreenSize (s: {height: number, width: number}): Size {
    return {
      h: s.height,
      w: s.width
    }
  }
}
