const { Plugin } = require('powercord/entities');
const { getModule } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');

const Settings = require('./components/settings.jsx');

module.exports = class NitroBypass extends Plugin {
	async startPlugin() {
		powercord.api.settings.registerSettings(this.entityID, {
			category: this.entityID,
			label: 'Nitro Bypass',
			render: Settings,
		});

		this.message = await getModule(['sendMessage', 'editMessage', "sendClydeError", "sendStickers"]);
		const currentUser = await getModule(['getCurrentUser']);
		this.getGuildId = (await getModule(['getLastSelectedGuildId'])).getGuildId;

		// spoof client side premium
		let tries = 1;
		let intervalId = setInterval(() => {
			if (++tries > 5) clearInterval(intervalId);

			const user = currentUser.getCurrentUser();
			if (!user) return;
			user.premiumType = 2;
			clearInterval(intervalId);
		}, 1000);

		const emojiReplacePatch = this.emojiReplacePatch.bind(this);
		const stickerReplacePatch = this.stickerReplacePatch.bind(this);
		const supressClyde = this.supressClyde.bind(this);
		
		inject('replace-on-send', this.message, 'sendMessage', emojiReplacePatch, true);
		inject('supress-clyde', this.message, 'sendClydeError', supressClyde, true);
		inject('send-stickers', this.message, 'sendStickers', stickerReplacePatch, true);
	}
	
	supressClyde(args) {
		// make clyde kill himself on sticker error
		if (args[1] === 50081)
			return [0, 0];
		else
			return args;
	}

	stickerReplacePatch(args) {
		// get the message id and the sticker id, then craft a new message :)
		const channel_id = args[0];
		const sticker_id = args[1][0];
		const sticker_uri = `https://media.discordapp.net/stickers/${sticker_id}.png?size=320`;
		this.message.sendMessage(channel_id, {content: sticker_uri, invalidEmojis: [], tts: false, validNonShortcutEmojis: []});
		return [];
	}

	emojiReplacePatch(args) {
		const message = args[1];
		const emojis = message.validNonShortcutEmojis;
		const guildId = this.getGuildId();

		emojis.forEach((emoji) => {
			// skip discord emojis
			if (!emoji.require_colons) return;

			// skip available emojis
			if (
				!this.settings.get('spoofAvailableEmojis', false) &&
				emoji.guildId === guildId && !emoji.animated
			)
				return;

			// create the emoji string which we will replace
			const emojiString = `<${emoji.animated ? 'a' : ''}:${emoji.originalName || emoji.name}:${
				emoji.id
			}>`;

			let url = emoji.url;

			// change the size of the emoji in the url
			const emojiSize = this.settings.get('size', 48);
			url = url.replace(/\?size=[0-9]+/, `?size=${emojiSize}`);

			// replace the message containing the emoji with the url
			message.content = message.content.replace(emojiString, url);
		});
		return args;
	}

	pluginWillUnload() {
		powercord.api.settings.unregisterSettings(this.entityID);

		uninject('replace-on-send');
	}
};
