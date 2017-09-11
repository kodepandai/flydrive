'use strict'

const fs = require('fs-extra')
const path = require('path')
const test = require('japa')
const LocalFileSystem = require('../../src/Drivers/LocalFileSystem')

function isWindowsDefenderError (error) {
  return error.code === 'EPERM'
}

function fullPath (relativePath) {
  return path.join(process.cwd(), `./tests/unit/storage/${relativePath}`)
}

test.group('Local Driver', group => {
  group.before(async () => {
    this.storage = new LocalFileSystem({ root: path.join(__dirname, '../../') })
    await fs.ensureDir(fullPath('.'))
  })

  group.afterEach(async () => {
    await fs.emptyDir(fullPath('.'))
  })

  test('find if a file exist', async (assert) => {
    await fs.outputFile(fullPath('i_exist'), '')
    const exists = await this.storage.exists('./tests/unit/storage/i_exist')
    assert.isTrue(exists)
  })

  test('create a file', async (assert) => {
    await this.storage.put('./tests/unit/storage/im_new', 'im_new')
    const contents = await this.storage.get('./tests/unit/storage/im_new')
    assert.equal(contents, 'im_new')
  })

  test('delete a file', async (assert) => {
    await fs.outputFile(fullPath('i_will_be_deleted'), '')

    try {
      await this.storage.delete('./tests/unit/storage/i_will_be_deleted')
      const exists = await this.storage.exists('./tests/unit/storage/i_will_be_deleted')
      assert.isFalse(exists)
    } catch (error) {
      if (!isWindowsDefenderError(error)) {
        throw error
      }
    }
  })

  test('move a file', async (assert) => {
    await fs.outputFile(fullPath('i_will_be_renamed'), '')

    await this.storage.move('./tests/unit/storage/i_will_be_renamed', './tests/unit/storage/im_renamed')
    assert.isTrue(await this.storage.exists('./tests/unit/storage/im_renamed'))
    assert.isFalse(await this.storage.exists('./tests/unit/storage/i_will_be_renamed'))
  })

  test('copy a file', async (assert) => {
    await fs.outputFile(fullPath('i_will_be_copied'), '')

    await this.storage.copy('./tests/unit/storage/i_will_be_copied', './tests/unit/storage/im_copied')
    assert.isTrue(await this.storage.exists('./tests/unit/storage/im_copied'))
    assert.isTrue(await this.storage.exists('./tests/unit/storage/i_will_be_copied'))
  })

  test('prepend to a file', async (assert) => {
    await fs.outputFile(fullPath('i_have_content'), 'world')

    await this.storage.prepend('./tests/unit/storage/i_have_content', 'hello ')
    const content = await this.storage.get('./tests/unit/storage/i_have_content')
    assert.equal(content, 'hello world')
  })

  test('append to a file', async (assert) => {
    await fs.outputFile(fullPath('i_have_content'), 'hello')

    await this.storage.append('./tests/unit/storage/i_have_content', ' universe')
    const content = await this.storage.get('./tests/unit/storage/i_have_content')
    assert.equal(content, 'hello universe')
  })
})
