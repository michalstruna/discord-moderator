import argv, { Arguments } from 'yargs-parser'
import { ActionMeta } from '../model/types'

import { InvalidInputError, NotFoundError } from './Errors'
import { codeList } from './Outputs'
import CommandService from '../service/CommandService'
import { multiFind } from '../utils/Collections'

const formatList = (vals: string[]) => codeList(vals, 'and')

type ParsedArgsMap = Record<string, string | string[]>

export class ParsedArgs {

    private args: ParsedArgsMap
    private rules: Arg[]

    constructor(args: ParsedArgsMap, rules: Arg[]) {
        this.args = args
        this.rules = rules
    }

    async analyze(meta: ActionMeta) {
        const analyzed: Record<string, any> = {}

        for (const rule of this.rules) {
            const arg = this.args[rule.getName()]

            if (arg !== undefined) {
                analyzed[rule.getName()] = await rule.parse(arg, meta) // TODO: Promise.all?
            }
        }

        return analyzed
    }

}

export class ArgParser {

    private args: Arguments

    constructor(input: string) {
        this.args = argv(input)
    }

    public shift() {
        return this.args._.shift()
    }

    public parse(rules: Arg[] = []) {
        const parsed: ParsedArgsMap = {}
        let tmpRules = [...rules]
        let reqRules = [...rules.filter(r => r.isRequired())]
        let tmpArgs = [...this.args._]

        for (const key in this.args) {
            if (key === '_') continue // Ignore positional args.
            const rule = tmpRules.find(r => r.getName() === key)
            const isList = rule instanceof List
            if (!rule) throw new InvalidInputError(`Unexpected argument \`${key}\`.`)
            if (!rule.test(this.args[key])) throw new InvalidInputError(`Invalid argument \`${key}\`.`)
            parsed[key] = isList ? [this.args[key]] : this.args[key]

            if (!isList || reqRules.length > tmpArgs.length) {
                tmpRules = tmpRules.filter(r => r.getName() !== key)
                reqRules = reqRules.filter(r => r.getName() != key)
            }
        }

        const reqExplRules = reqRules.filter(r => r.isExplicit())
        if (reqExplRules.length > 0) throw new InvalidInputError(`You have to specify ${formatList(reqExplRules.map(r => r.getName()))}`)
        tmpRules = tmpRules.filter(r => !r.isExplicit())

        while (true) {
            if (tmpRules.length === 0 && tmpArgs.length === 0) { // All rules and args are consumed.
                return new ParsedArgs(parsed, rules)
            }

            if (tmpRules.length === 0 && tmpArgs.length > 0) { // There are args, but no rules.
                throw new InvalidInputError(`Unknown argument ${formatList(tmpArgs)}.`)
            }

            if (tmpArgs.length === 0 && tmpRules.length > 0) { // There are rules, but no args.
                if (reqRules.length == 0) return new ParsedArgs(parsed, rules)
                throw new InvalidInputError(`You have to specify ${formatList(reqRules.map(r => r.getName()))}.`)
            }

            const rule = tmpRules[0], arg = tmpArgs[0]
            const isList = rule instanceof List

            if ((rule.isRequired() || reqRules.length < tmpArgs.length) && rule.test(arg)) { // Consume rule and arg.
                parsed[rule.getName()] = isList ? [...(parsed[rule.getName()] as string[] || []), arg] : arg

                if (!isList || reqRules.length > tmpArgs.length - 1) {
                    tmpRules.shift()
                    if (rule.isRequired()) reqRules.shift()
                }

                tmpArgs.shift()
                continue
            }

            if (!rule.isRequired() || (isList && parsed[rule.getName()].length > 0)) { // For optional argument, it is possible consume only rule.
                tmpRules.shift()
                continue
            } else {
                throw new InvalidInputError(`You have to specify ${formatList([rule.getName()])}.`)
            }
        }
    }

}

export abstract class Arg {

    protected name: string
    protected description?: string
    
    protected needName?: boolean
    protected required?: boolean
    protected defaultValue?: any
    protected maximum?: number
    protected minimum?: number

    constructor(name: string, description?: string) {
        this.name = name
        this.description = description
    }

    public async parse(input: string | string[], meta: ActionMeta): Promise<any> {
        return input
    }

    public getName() {
        return this.name
    }

    public getDescription() {
        return this.description
    }

    public getDefault() {
        return this.defaultValue
    }

    public isRequired() {
        return this.required
    }

    public isExplicit() {
        return this.needName
    }

    public test(value: string) {
        return true
    }

    public toString() {
        let result = this.name
        if (this.needName) result = this.required ? `-${this.name} ${this.name}` : `-${this.name} <${this.name}>`
        result = this.required ? `<${result}>` : `[${result}]`
        return result
    }

    public default(value: any) {
        this.defaultValue = value
        return this
    }

    public req(required: boolean = true) {
        this.required = required
        return this
    }

    public max(max: number) {
        this.maximum = max
        return this
    }

    public min(min: number) {
        this.minimum = min
        return this
    }

    public explicit(needName: boolean = true) {
        this.needName = needName
        return this
    }

}

export class Text extends Arg {

}

export class Cmd extends Text {

    public async parse(value: string) {
        const command = await CommandService.getByName(value)

        if (!command) {
            throw new NotFoundError(`Command \`${value}\` was not found.`)
        }

        return command
    }

}

export class Mention extends Text {

}

export class Member extends Mention {

    public static CURRENT = {}

    public async parse(value: string, { msg }: ActionMeta) {
        const member = multiFind(msg.guild!.members.cache, value, m => ([m.displayName, m.user.tag]))
        if (member) return member
        if (this.defaultValue === Member.CURRENT) return msg.member
        throw new NotFoundError(`Member \`${value}\` was not found.`)
    }

}

export class Role extends Mention {

    public static EVERYONE = {}

    public async parse(value: string, { msg }: ActionMeta) {
        const role = multiFind(msg.guild!.roles.cache, value, r => ([r.name]))
        if (role) return role
        if (this.defaultValue === Role.EVERYONE) return msg.guild!.roles.everyone
        throw new NotFoundError(`Role \`${value}\` was not found.`)
    }

}

export class Channel extends Mention {

    public static CURRENT = {}

    public async parse(input: string, { msg }: ActionMeta) {
        const channel = msg.guild?.channels.cache.get(input)
        if (channel) return channel
        if (this.defaultValue === Channel.CURRENT) return msg.channel
        throw new NotFoundError(`Channel \`${input}\` was not found.`)
    }

}

export class Real extends Arg {

}

export class Int extends Real {

}

export class Bool extends Arg {

    constructor(name: string, description?: string) {
        super(name, description)
        this.explicit()
    }

    public toString() {
        if (this.required) return super.toString().replace(/[\[\]\<\>]/g, '').replace(/ .*/, '')
        return super.toString().split(' ')[0] + ']'
    }

}

export class Switch extends Bool {

    constructor(name: string, description?: string) {
        super(name, description)
        this.req()
    }

}

export class List extends Arg {

    protected type: Text
    protected withJoin?: boolean

    constructor(name: string, description?: string) {
        super(name, description)
        this.type = new Text(name, description)
    }

    public toString() {
        return super.toString().replace('>]', '...>]')
    }

    public test(value: string) {
        return this.type.test(value)
    }

    public async parse(values: string | string[], meta: ActionMeta) {
        const arrayVals = Array.isArray(values) ? values : [values]
        const parsed = await Promise.all(arrayVals.map(v => this.type.parse(v, meta)))
        return this.withJoin ? parsed.join(' ') : parsed
    }

    public of(type: Text) {
        this.type = type
        return this
    }

    public join(withJoin: boolean = true) {
        this.withJoin = withJoin
        return this
    }

}
