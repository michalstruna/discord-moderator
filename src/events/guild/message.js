const CommandService = require('../../service/CommandService')
const ServerService = require('../../service/ServerService')

module.exports = async (client, msg) => {
    if (msg.author.bot) return // Do not process bot messages.

    const server = await ServerService.getById(msg.guild.id)

    if (!msg.content.startsWith(server.prefix)) return // Ignore non-command messages.

    const args = msg.content.split(/ +/)
    const cmd = args.shift().toLowerCase().slice(server.prefix.length)
    const command = client.commands.get(cmd)

    if (command) {
        CommandService.execute(command, client, msg, args)
    }
}
