const CommandService = require('../../service/CommandService')
const MessageService = require('../../service/MessageService')
const ServerService = require('../../service/ServerService')

module.exports = async (client, msg) => {
    if (msg.author.bot) return // Do not process bot messages.
    const server = await ServerService.getById(msg.guild.id, msg.guild)
    const meta = { client, server, msg, guild: msg.guild }
    if (!msg.content.startsWith(server.prefix)) return // Ignore non-command messages.

    const [commandName, argsSet] = MessageService.parseCommand(msg.content, server.prefix)
    const command = CommandService.getByName(commandName)

    if (command) {
        CommandService.execute(command, argsSet, meta)
    } else {
        // TODO: Did you mean ...?
    }
}
