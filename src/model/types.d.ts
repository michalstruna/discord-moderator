import { Client, Guild, GuildMember, Message, TextBasedChannel, TextChannel } from 'discord.js'

import RoleType from '../constants/RoleType'
import { Arg } from '../utils/Args'

export type DiscordId = string

export type ServerAuth = {
    permitDefault: DiscordId[]
    denyDefault: DiscordId[]
    permit: DiscordId[]
    deny: DiscordId[]
}

export type ServerAction = {
    auth: ServerAuth
}

export type ServerCommand = {
    actions: Record<string, ServerAction>
    enabled: boolean
}

export type Auth = {
    permit?: RoleType[]
    deny?: RoleType[]
}

export type ServerRoles = Record<RoleType, string>

export type ServerData = {
    id: string
    prefix: string
    commands: Record<string, ServerCommand>
    roles: ServerRoles
}

export type ActionMeta = {
    msg: Message
    client: Client
    server: ServerData
}

type ArgArrayToObject<A extends readonly Arg<any, any>[]> = { [T in A[number]
    as T extends Arg<infer N, any> ? N : never
    ]: T extends Arg<any, infer V> ? V : never } extends infer O ? { [K in keyof O]: O[K] } : never
  

export type ActionOptions<A extends readonly Arg<any, any>[]> = {
    name: string
    args?: readonly [...A],
    auth?: Auth
    execute: (args: ArgArrayToObject<A>, meta: ActionMeta) => Promise<void>
    description?: string
    examples?: string[][]
    react?: boolean
}

export type CommandOptions = {
    name: string
    aliases?: string[]
    description?: string
    actions: ActionOptions<any>[]
}

export type Part<T> = {
    [P in keyof T]?: Part<T[P]>
}