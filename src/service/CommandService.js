exports.execute = async (command, client, msg, args) => {
    try {
        console.log(`command: ${msg.content}`, args)
        await command.execute(client, msg, args)
    } catch (error) {
        console.error(error)
    }
}