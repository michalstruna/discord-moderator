const Emoji = require("../constants/Emoji")

exports.Emoji = Emoji

exports.react = (msg, emoji = Emoji.SUCCESS) => {
    msg.react(emoji)
}