const help = () => ({
    actions: [
        {
            key: 'run',
            name: 'Send hello',
            pattern: 'hello [@user?] [#channel?]',
            args: [
                { name: 'user', description: 'The user you wants to greet', default: 'yourself' },
                { name: 'channel', description: 'The channel where you want to greet', default: 'current channel' }
            ],
            examples: [
                { pattern: 'hello', description: 'Send hello to current channel to yourself.' },
                { pattern: 'hi @Michal #general', description: 'Send hello to general chat to Michal.' }
            ]
        }
    ]
})

module.exports = {
    name: ['hello', 'hi'],
    description: 'Simple command for sending hello into chat. Its main purpose is to test if bot is working.',
    help,
    on: {
        async run(client, msg) {
            const channel = msg.mentions.channels.first() || msg.channel
            const user = msg.mentions.users.first() || msg.author
            channel.send(`Hello ${user}!`)
        }
    }
}