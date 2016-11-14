import assert from 'assert'

describe('api', () => {
  let Api
  before(() => {
    Api = require('../src/api')
  })

  it('create', () => {
    const api = new Api()
    assert(typeof api.create === 'function')
  })

  it('send', () => {
    const api = new Api()
    assert(typeof api.send === 'function')
  })
})
