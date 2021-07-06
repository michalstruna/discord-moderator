module.exports = {
    name: 'hello',
    description: 'Send hello to chat.',
    async execute(client, msg, args) {
        console.log(msg.content, args)
        msg.channel.send('Hello!')
    }
}
