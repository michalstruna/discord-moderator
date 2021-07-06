module.exports = {
    name: 'hello',
    description: 'Send hello to chat.',
    async execute(client, msg, args) {
        msg.channel.send('Hello!')
    }
}
