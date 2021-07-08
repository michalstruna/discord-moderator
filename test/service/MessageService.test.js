const Config = require('../../src/constants/Config.js')
const MessageService = require('../../src/service/MessageService')

const prefix = Config.DEFAULT_PREFIX
const cmd = content => MessageService.parseCommand(`${prefix}${content}`, prefix)

describe('parseCommand', () => {

    test('Empty command', () => {
        const [commandName, args] = cmd('hello')
        expect(commandName).toEqual('hello')
        expect(args).toEqual([])
    })

    test('One argument', () => {
        const [commandName, args] = cmd('hello world!')
        expect(commandName).toEqual('hello')
        expect(args).toEqual(['world!'])
    })

    test('Three arguments', () => {
        const [commandName, args] = cmd('hello world ! 123')
        expect(commandName).toEqual('hello')
        expect(args).toEqual(['world', '!', '123'])
    })

    test('Spaces', () => {
        const [commandName, args] = cmd('   hello  world  !     ')
        expect(commandName).toEqual('hello')
        expect(args).toEqual(['world', '!'])
    })

    test('No command', () => {
        const [commandName, args] = MessageService.parseCommand('hello world!', prefix)
        expect(commandName).toEqual(null)
        expect(args).toEqual(['hello', 'world!'])
    })

    test('Upper case', () => {
        const [commandName, args] = cmd('HEllO WoRlD!')
        expect(commandName).toEqual('hello')
        expect(args).toEqual(['world!']) 
    })

})

describe('parseArgs', () => {

    test('No args', () => {
        const rules = []
        const args = MessageService.parseArgs([], rules)
        expect(args).toEqual({ args: [] })
    })

    test('No parsed args', () => {
        const rules = [{ name: 'test', value: ['a', 'b'] }]
        const args = MessageService.parseArgs([], rules)
        expect(args).toEqual({ args: [] })
    })

    test('Rest args', () => {
        const rules = [{ name: 'test', value: ['a', 'b'] }]
        const args = MessageService.parseArgs(['c'], rules) 
        expect(args).toEqual({ args: ['c'] })
    })

    test('Rest args 2', () => {
        const rules = [{ name: 'test', value: ['a', 'b'] }]
        const args = MessageService.parseArgs(['b', 'c'], rules)
        expect(args).toEqual({ test: 'b', args: ['c'] })
    })

    test('Rest args 3', () => {
        const rules = [{ name: 'test', value: ['a', 'b'] }]
        const args = MessageService.parseArgs(['b'], rules) 
        expect(args).toEqual({ test: 'b', args: [] })
    })

    test('Named args default value', () => {
        const rules = [{ name: 'test', value: ['a', 'b'], defaultValue: 'c' }]
        const args = MessageService.parseArgs(['b'], rules) 
        expect(args).toEqual({ test: 'b', args: [] })
    })

    test('Named args default value 2', () => {
        const rules = [{ name: 'test', value: ['a', 'b'], defaultValue: 'c' }]
        const args = MessageService.parseArgs(['d'], rules) 
        console.log(args)
        expect(args).toEqual({ test: 'c', args: ['d'] })
    })

    test('Named args regex', () => {
        const rules = [{ name: 'test', value: /^[0-9]+$/, defaultValue: 'c' }]
        const args = MessageService.parseArgs(['d', '2', '3'], rules)
        expect(args).toEqual({ test: '2', args: ['d', '3'] })
    })

    test('Hello', () => {
        const rules = [
            { name: 'word', value: ['hello', 'hi', 'bye'], default: 'hello' },
            { name: 'age', value: Regex.Type.REAL },
            { name: 'name', value: Regex.Type.ANY, required: true },
        ]
    })

})