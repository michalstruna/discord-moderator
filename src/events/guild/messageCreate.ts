import { Client, Message } from 'discord.js'

import { ActionMeta } from '../../model/types'
import CommandService from '../../service/CommandService'
import Io from '../../service/Io'
import ServerService from '../../service/ServerService'

const handleCommand = async (meta: ActionMeta) => {
    if (!meta.msg.content.startsWith(meta.server.prefix)) return // Ignore non-command messages.
    const [commandName, argParser] = Io.parseCommand(meta.msg.content, meta.server.prefix)
    const command = CommandService.getByName(commandName!)

    if (command) {
        CommandService.execute(command, argParser!, meta)
    } else {
        const command = CommandService.getBySimilarName(commandName!)

        if (command && await Io.confirm(meta.msg.channel, `Did you mean \`${command.name}\`?`, [meta.msg.author.id])) {
            CommandService.execute(command, argParser!, meta)
        }
    }
}

export default async (client: Client, msg: Message) => {
    if (msg.author.bot) return // Do not process bot messages.
    const server = await ServerService.getById(msg.guild!.id, msg.guild!)
    const meta = { client, server, msg, guild: msg.guild!, channel: msg.channel, author: msg.member! }
    await handleCommand(meta)
}
