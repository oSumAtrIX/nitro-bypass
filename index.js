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

		const parse = await getModule(['parse', 'parsePreprocessor']);
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
		inject('replace-on-parse', parse, 'parse', emojiReplacePatch, false);
	}

	emojiReplacePatch(args, message) {
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

		return message;
	}

	pluginWillUnload() {
		powercord.api.settings.unregisterSettings(this.entityID);

		uninject('replace-on-parse');
	}
};
