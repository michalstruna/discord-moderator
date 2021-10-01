import { Client, Message } from 'discord.js'
import { RawMessageData } from 'discord.js/typings/rawDataTypes'

import CommandService from '../../service/CommandService'
import MessageService from '../../service/MessageService'
import ServerService from '../../service/ServerService'

const handleMessageCreate = async (client: Client, msg: Message) => {
    if (msg.author.bot) return // Do not process bot messages.
    const server = await ServerService.getById(msg.guild!.id, msg.guild!)
    const meta = { client, server, msg, guild: msg.guild!, channel: msg.channel, author: msg.member! }
    if (!msg.content.startsWith(server.prefix)) return // Ignore non-command messages.

    const [commandName, ArgParser] = MessageService.parseCommand(msg.content, server.prefix)
    const command = CommandService.getByName(commandName!)

    if (command) {
        CommandService.execute(command, ArgParser, meta)
    } else {
        const command = CommandService.getBySimilarName(commandName!)

        if (command && await MessageService.confirm(msg.channel, `Did you mean \`${command.name}\`?`, [msg.author.id])) {
            //handleMessageCreate(client, new Message(client, { ...(msg.toJSON() as RawMessageData), content: msg.content.replace(commandName!, command.name) }))
        } else {

        }
    }
}

export default handleMessageCreate