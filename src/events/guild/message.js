const CommandService = require('../../service/CommandService')

const PREFIX = '&' // TODO: From DB.

module.exports = async (client, msg) => {
    if (msg.author.bot) return // Do not process bot messages.

    if (!msg.content.startsWith(PREFIX)) return // Ignore non-command messages.

    const args = msg.content.split(/ +/)
    const cmd = args.shift().toLowerCase().slice(PREFIX.length)
    const command = client.commands.get(cmd)

    if (command) {
        CommandService.execute(command, client, msg, args)
    }
}
