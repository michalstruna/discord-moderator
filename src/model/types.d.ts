import { Client, Guild, GuildMember, Message, TextChannel } from 'discord.js'

import RoleType from '../constants/RoleType'

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
    actions: Map<string, ServerAction>
    enabled: boolean
}

export type Argument = {

}

export type Auth = {
    permit?: RoleType[]
    deny?: RoleType[]
}

export type Server = {
    id: string
    prefix: string
    commands: Map<string, ServerCommand>
    roles: Map<RoleType, string>
}

export type ActionMeta = {
    msg: Message
    guild: Guild
    client: Client
    server: Server
    channel: TextChannel
    author: GuildMember
}

export type Action = {
    name: string
    args?: Argument[],
    auth?: Auth
    execute: (args: Record<string, any>, meta: ActionMeta) => Promise<void>
    description?: string
    examples?: string[][]
}

export type CommandOptions = {
    name: string
    aliases?: string[]
    description?: string
    actions: Action[]
}