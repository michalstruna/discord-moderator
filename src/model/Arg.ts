import argv from 'yargs-parser'
import { ColorResolvable, GuildMember, Role as GuildRole, TextBasedChannels, Message as DiscordMessage } from 'discord.js'

import { ActionMeta, CommandOptions } from './types'
import { InvalidInputError, NotFoundError } from './Error'
import { codeList } from '../utils/Outputs'
import CommandService from '../service/CommandService'
import { multiFind } from '../utils/Collections'
import Regex from '../utils/Regex'

const formatList = (vals: string[]) => codeList(vals, 'and')

type ParsedArgsMap = Record<string, string | string[]>

export class ParsedArgs {

    private args: ParsedArgsMap
    private rules: readonly Arg<any, any>[]

    constructor(args: ParsedArgsMap, rules: readonly Arg<any, any>[]) {
        this.args = args
        this.rules = rules
    }

    async analyze(meta: ActionMeta) {
        const analyzed: Record<string, any> = {}

        for (const rule of this.rules) {
            const arg = this.args[rule.getName()]

            if (arg !== undefined || rule.getDefault()) {
                analyzed[rule.getName()] = await rule.parse(arg, meta)
            }
        }

        return analyzed
    }

}

export class ArgParser {

    private input: string

    constructor(input: string) {
        this.input = input
    }

    public parse(rules: readonly Arg<any, any>[] = []) {
        const narg: Record<string, number> = {}
        const coerce: Record<string, (value: any) => any> = {}
        const boolean: string[] = []
        const string: string [] = []

        for (const rule of rules) {
            if (!(rule instanceof Real) && !(rule instanceof Bool)) string.push(rule.getName())
            if (rule instanceof Bool) boolean.push(rule.getName())

            if (Arg.isMulti(rule)) {
                narg[rule.getName()] = 10e10
                if (rule instanceof Text) coerce[rule.getName()] = value => value.join(' ')
            }
        }

        const args = argv(this.input, { 
            boolean, string, narg, coerce,
            configuration: {
                'camel-case-expansion': false
            }
        })

        const parsed: ParsedArgsMap = {}
        let tmpRules = [...rules]
        let reqRules = [...rules.filter(r => r.isRequired())]
        let tmpArgs = [...args._]

        for (const key in args) {
            if (key === '_') continue // Ignore positional args.
            const rule = tmpRules.find(r => r.getName() === key)
            const isList = rule instanceof List
            if (!rule) throw new InvalidInputError(`Unexpected argument \`${key}\`.`)
            if (!rule.test(args[key])) throw new InvalidInputError(`Invalid argument \`${key}\`.`)
            parsed[key] = rule instanceof List && !Array.isArray(args[key]) ? [args[key]] : args[key]

            if (!isList || reqRules.length > tmpArgs.length) {
                tmpRules = tmpRules.filter(r => r.getName() !== key)
                reqRules = reqRules.filter(r => r.getName() !== key)
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
                throw new InvalidInputError(`Unknown arguments ${formatList(tmpArgs)}.`)
            }

            if (tmpArgs.length === 0 && tmpRules.length > 0) { // There are rules, but no args.
                if (reqRules.length == 0) return new ParsedArgs(parsed, rules)
                throw new InvalidInputError(`You have to specify ${formatList(reqRules.map(r => r.getName()))}.`)
            }

            const rule = tmpRules[0], arg = tmpArgs[0]
            const isList = rule instanceof List
            const isMulti = rule instanceof Text && rule.isMulti()

            if ((rule.isRequired() || reqRules.length < tmpArgs.length) && rule.test(arg)) { // Consume rule and arg.
                parsed[rule.getName()] = isList ? [...(parsed[rule.getName()] as string[] || []), arg] : (isMulti ? (parsed[rule.getName()] || '') + ' ' + arg : arg)

                if ((!isList && !isMulti) || reqRules.length > tmpArgs.length - 1) {
                    tmpRules.shift()
                    if (rule.isRequired()) reqRules.shift()
                }

                tmpArgs.shift()
                continue
            }

            if (rule.getDefault()) {
                parsed[rule.getName()] = null as any
                tmpRules.shift()
                if (rule.isRequired()) reqRules.shift()
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

export abstract class Arg<Name extends string, Result> {

    protected name?: Name
    protected description?: string
    
    protected needName?: boolean
    protected required?: boolean
    protected defaultValue?: any
    protected maximum?: number
    protected minimum?: number

    public static isMulti(arg: Arg<any, any>): boolean {
        if (arg instanceof Text && arg.isMulti()) return true
        if (arg instanceof List) return true
        return false
    }

    constructor(name?: Name, description?: string) {
        this.name = name
        this.description = description
    }

    public async parse(input: string | string[], meta: ActionMeta): Promise<Result> {
        return (input ?? this.getDefault()) as any
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
        let result: string = this.name || ''
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

export class Text<Name extends string> extends Arg<Name, string> {

    protected _multi: boolean = false

    public async parse(value: string, meta: ActionMeta) {
        return (await super.parse(value, meta)).toString()
    }

    public multi(isMulti = true) {
        this._multi = isMulti
        return this
    }

    public isMulti() {
        return this._multi
    }

}

export class Color<Name extends string> extends Arg<Name, ColorResolvable> {}

export class Cmd<Name extends string> extends Arg<Name, CommandOptions> {

    public async parse(value: string) {
        const command = await CommandService.getByName(value)

        if (!command) {
            throw new NotFoundError(`Command \`${value}\` was not found.`)
        }

        return command
    }

}

export class Member<Name extends string> extends Arg<Name, GuildMember> {

    public static CURRENT = { toString: () => 'author' }

    public async parse(value: string, { msg }: ActionMeta) {
        const member = multiFind(msg.guild!.members.cache, value, m => ([m.displayName, m.user.tag]))
        if (member) return member
        if (this.defaultValue === Member.CURRENT) return msg.member! //
        throw new NotFoundError(`Member \`${value}\` was not found.`)
    }

}

export class Role<Name extends string> extends Arg<Name, GuildRole> {

    public static EVERYONE = { toString: () => 'everyone' }

    public async parse(value: string, { msg }: ActionMeta) {
        const role = multiFind(msg.guild!.roles.cache, value, r => ([r.name]))
        if (role) return role
        if (this.defaultValue === Role.EVERYONE) return msg.guild!.roles.everyone
        throw new NotFoundError(`Role \`${value}\` was not found.`)
    }

}

export class Channel<Name extends string> extends Arg<Name, TextBasedChannels> {

    public static CURRENT = { toString: () => 'current' }

    public test(value: string) {
        return Regex.CHANNEL.test(value)
    }

    public async parse(input: string, { msg }: ActionMeta) {
        const channel = msg.guild?.channels.cache.get(input?.replace(/[^0-9]/g, '')) as TextBasedChannels
        if (channel) return channel
        if (this.defaultValue === Channel.CURRENT) return msg.channel
        throw new NotFoundError(`Channel \`${input}\` was not found.`)
    }

}

export class Message<Name extends string> extends Arg<Name, DiscordMessage> {

    public test(value: string) {
        return Regex.MESSAGE.test(value)
    }

    public async parse(input: string, { msg }: ActionMeta) {
        return ((msg.mentions.channels.first() || msg.channel) as TextBasedChannels).messages.fetch(input)
    }

}

export class Real<Name extends string> extends Arg<Name, number> {

    public test(input: string) {
        return /[0-9]/.test(input)
    }

    public async parse(input: string, meta: ActionMeta) {
        const val = parseFloat(await super.parse(input, meta) as any)

        if (this.minimum !== undefined && this.minimum > val) throw new InvalidInputError(`\`${this.getName()}\` must be \`${this.minimum}\` or greater.`)
        if (this.maximum !== undefined && val > this.maximum) throw new InvalidInputError(`\`${this.getName()}\` must be \`${this.maximum}\` or lower.`)

        return val
    }

}

export class Int<Name extends string> extends Real<Name> {

    public async parse(input: string, meta: ActionMeta) {
        return Math.floor(await super.parse(input, meta))
    }

}

export class Bool<Name extends string> extends Arg<Name, boolean> {

    constructor(name?: Name, description?: string) {
        super(name, description)
        this.explicit()
    }

    public toString() {
        if (this.required) return super.toString().replace(/[\[\]\<\>]/g, '').replace(/ .*/, '')
        return super.toString().split(' ')[0] + ']'
    }

}

export class Switch<Name extends string> extends Bool<Name> {

    constructor(name?: Name, description?: string) {
        super(name, description)
        this.req()
    }

}

type GetResult<T> = T extends Arg<any, infer Result> ? Result : never

export class List<Name extends string, Type extends Arg<any, any>> extends Arg<Name, any> {

    protected type: Type

    constructor(name: Name, description: string, type: Type) {
        super(name, description)
        this.type = type
    }

    public toString() {
        return super.toString().replace(/(>\]?)/, '...$1')
    }

    public test(value: string) {
        return this.type.test(value)
    }

    public async parse(values: string[], meta: ActionMeta): Promise<GetResult<Type>[]> {
        const arrayVals = Array.isArray(values) ? values : [values]
        const parsed = await Promise.all(arrayVals.map(v => this.type.parse(v, meta)))
        return parsed
    }

}