const Config = require('../../src/constants/Config.js')
const MessageService = require('../../src/service/MessageService')
const { InvalidInputError } = require('../../src/utils/Errors.js')

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
        expect(args).toEqual(['WoRlD!']) 
    })

})

describe('parseArgs', () => {

    test('No args', () => {
        const rules = []
        const args = MessageService.parseArgs([], rules)
        expect(args).toEqual({ args: [], flags: {} })
    })

    test('No parsed args', () => {
        const rules = [{ name: 'test', value: ['a', 'b'] }]
        const args = MessageService.parseArgs([], rules)
        expect(args).toEqual({ args: [], flags: {} })
    })

    test('Rest args', () => {
        const rules = [{ name: 'test', value: ['a', 'b'] }]
        const args = MessageService.parseArgs(['c'], rules) 
        expect(args).toEqual({ args: ['c'], flags: {} })
    })

    test('Rest args 2', () => {
        const rules = [{ name: 'test', value: ['a', 'b'] }]
        const args = MessageService.parseArgs(['b', 'c'], rules)
        expect(args).toEqual({ test: 'b', args: ['c'], flags: {} })
    })

    test('Rest args 3', () => {
        const rules = [{ name: 'test', value: ['a', 'b'] }]
        const args = MessageService.parseArgs(['b'], rules) 
        expect(args).toEqual({ test: 'b', args: [], flags: {} })
    })

    test('Named args default value', () => {
        const rules = [{ name: 'test', value: ['a', 'b'], defaultValue: 'c' }]
        const args = MessageService.parseArgs(['b'], rules) 
        expect(args).toEqual({ test: 'b', args: [], flags: {} })
    })

    test('Named args default value 2', () => {
        const rules = [{ name: 'test', value: ['a', 'b'], defaultValue: 'c' }]
        const args = MessageService.parseArgs(['d'], rules)
        expect(args).toEqual({ test: 'c', args: ['d'], flags: {} })
    })

    test('Named args regex', () => {
        const rules = [{ name: 'test', value: /^[0-9]+$/, defaultValue: 'c' }]
        const args = MessageService.parseArgs(['d', '2', '3'], rules)
        expect(args).toEqual({ test: '2', args: ['d', '3'], flags: {} })
    })

    test('Hello', () => {
        const rules = [
            { name: 'word', value: ['hello', 'hi', 'bye'], defaultValue: 'hello' },
            { name: 'age', value: /^[0-9]+(\.[0-9]+)?/ },
            { name: 'name', value: /^.*$/, required: true },
        ]

        const parseArgs = () => MessageService.parseArgs([], rules)
        expect(parseArgs).toThrow(InvalidInputError)
        expect(parseArgs).toThrow('You need to specify **name**.')
    })

    test('Hello 2', () => {
        const rules = [
            { name: 'word', value: ['hello', 'hi', 'bye'], defaultValue: 'hello' },
            { name: 'age', value: /^[0-9]+(\.[0-9]+)?/ },
            { name: 'name', value: /^.*$/, required: true },
        ]

        const args = MessageService.parseArgs(['Michal'], rules)
        expect(args).toEqual({ name: 'Michal', word: 'hello', args: [], flags: {} })
    })

    test('Hello 3', () => {
        const rules = [
            { name: 'word', value: ['hello', 'hi', 'bye'], defaultValue: 'hello' },
            { name: 'age', value: /^[0-9]+(\.[0-9]+)?/ },
            { name: 'name', value: /^.*$/, required: true },
        ]

        const args = MessageService.parseArgs(['Michal', 'Hi', '19'], rules)
        expect(args).toEqual({ name: 'Michal', word: 'hi', age: '19', args: [], flags: {} })
    })

    test('Only flag', () => {
        const args = MessageService.parseArgs(['-rm'], [])
        expect(args).toEqual({ args: [], flags: { rm: true } })
    })

    test('More flags', () => {
        const args = MessageService.parseArgs(['-reset', '-rm', '-help'], [])
        expect(args).toEqual({ args: [], flags: { reset: true, rm: true, help: true } })
    })

    test('Flags with args', () => {
        const args = MessageService.parseArgs(['reset', '-rm', 'help', '-abc'], [{ name: 'test', value: /^.*$/ }])
        expect(args).toEqual({ test: 'reset', args: ['help'], flags: { rm: true, abc: true } })
    })

    // TODO: Test flag named arguments.

})