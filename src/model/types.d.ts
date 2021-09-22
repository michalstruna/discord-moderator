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

export type Action = {
    name: string
    args?: Arg[],
    auth?: Auth
    execute: (args: Record<string, any>, meta: ActionMeta) => Promise<void>
    description?: string
    examples?: string[][]
    react?: boolean
}

export type CommandOptions = {
    name: string
    aliases?: string[]
    description?: string
    actions: Action[]
}

export type Part<T> = {
    [P in keyof T]?: Part<T[P]>
}