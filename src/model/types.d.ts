import { Client, Message, Role } from 'discord.js'
import CommandCategory from '../constants/CommandCategory'

import RoleType from '../constants/RoleType'
import { Arg } from './Arg'

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

export type Auth<RoleType = Role> = {
    permit: RoleType[]
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

type ArgArrayToObject<Args extends readonly Arg<any, any>[]> = {
    [T in Args[number] as T extends Arg<infer Name, any> ? Name : never]: T extends Arg<any, infer Result> ? Result : never
} extends infer O ? { [K in keyof O]: O[K] } : never
  

export type ActionOptions<A extends readonly Arg<any, any>[] = any> = {
    name: string
    args?: readonly [...A]
    auth?: Auth<RoleType>
    execute: (args: ArgArrayToObject<A>, meta: ActionMeta) => Promise<void>
    description?: string
    examples?: string[][]
    react?: boolean
}

export type CommandOptions = {
    name: string
    category: CommandCategory
    aliases?: string[]
    description?: string
    actions: ActionOptions<any>[]
}

export type Part<T> = {
    [P in keyof T]?: Part<T[P]>
}