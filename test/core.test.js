/* @flow */
import { describe, it, beforeEach, afterEach } from 'mocha'
import { spy as sinonSpy, useFakeTimers } from 'sinon'
import { random, internet } from 'faker'
import { throws } from 'assert-exception'
import cookies from 'js-cookie'
import isUrl from 'is-url'
import assert from 'assert'
import {
  OPTIONS,
  SESSION_TIME,
  INTERACT
} from '../src/constants'

function toMin (msec: number): number {
  return msec * 1000 * 60
}

describe('core', () => {
  const Agent = require('../src/core').default
  const Base = require('../src/events').default
  const mitt = require('mitt')
  const Raven = OPTIONS.Raven

  function eventFactory (target, type, emitter) {
    return class DummyEvents extends Base {
      validate () {
        return true
      }
      on () {
        super.on(target, type, () => {})
        emitter.on('test', data => super.emit(data))
      }
    }
  }

  let agent, emitter, timer
  beforeEach(() => {
    emitter = mitt()
    timer = useFakeTimers(new Date().getTime())

    agent = new Agent(
      random.alphaNumeric(),
      [
        eventFactory(window, 'click', emitter),
        eventFactory(window, 'scroll', emitter)
      ],
      {
        baseUrl: internet.url(),
        cookieName: random.alphaNumeric(),
        cookieDomain: random.alphaNumeric(),
        cookieExpires: 0,
        Raven: Raven
      }
    )
  })

  afterEach(() => {
    timer.restore()
    agent.destroy()
  })

  it('instance', () => {
    assert(agent)
  })

  it('listen before send pageview', () => {
    assert(throws(() => { agent.listen() }).message === 'need send pageview')

    agent.loaded = true

    assert(throws(() => { agent.listen() }).message === 'need send pageview')
  })

  it('send failed', () => {
    agent.send('pageview', location.pathname)
    const spy = sinonSpy(require('../src/requests'), 'get')

    emitter.emit('test', {
      x: -1,
      y: -1
    })
    timer.tick(toMin(SESSION_TIME))

    assert(spy.called === false)

    spy.restore()
  })

  it('send success', () => {
    agent.send('pageview', location.pathname)

    assert(cookies.get(OPTIONS.cookieName))

    const spy = sinonSpy(require('../src/requests'), 'get')

    emitter.emit('test', {
      x: random.number({min: 1}),
      y: random.number({min: 1})
    })

    timer.tick(toMin(SESSION_TIME))

    const url = spy.getCall(0).args[0]
    assert(url.split('/').length === 8)
    assert(url.split('/')[4].length === 32)
    assert(url.split('/')[5].length === 13)
    assert(url.split('/')[6] === 'interact')
    assert(isUrl(url))

    assert(spy.getCall(0).args[1].length === INTERACT)

    const before = spy.callCount
    assert(before > 0)

    timer.tick(toMin(1))

    assert(spy.callCount === before, 'stop tracking')

    spy.restore()
  })
})
