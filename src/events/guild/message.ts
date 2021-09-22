import { Client, Message, TextChannel } from 'discord.js'

import CommandService from '../../service/CommandService'
import MessageService from '../../service/MessageService'
import ServerService from '../../service/ServerService'

export default async (client: Client, msg: Message) => {
    if (msg.author.bot) return // Do not process bot messages.
    const server = await ServerService.getById(msg.guild!.id, msg.guild!)
    const meta = { client, server, msg, guild: msg.guild!, channel: msg.channel as TextChannel, author: msg.member! }
    if (!msg.content.startsWith(server.prefix)) return // Ignore non-command messages.

    const [commandName, ArgParser] = MessageService.parseCommand(msg.content, server.prefix)
    const command = CommandService.getByName(commandName!)

    if (command) {
        CommandService.execute(command, ArgParser, meta)
    } else {
        // TODO: Did you mean ...?
    }
}