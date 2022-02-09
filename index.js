const { Plugin } = require('powercord/entities');
const { React, getModule } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');

const Settings = require('./components/settings.jsx');

module.exports = class NitroBypass extends Plugin {
	async startPlugin() {
		powercord.api.settings.registerSettings(this.entityID, {
			category: this.entityID,
			label: 'Nitro Bypass',
			render: Settings,
		});

		const message = await getModule(['sendMessage', 'editMessage']);
		const currentUser = await getModule(['getCurrentUser']);

		// spoof client side premium
		currentUser.getCurrentUser().premiumType = 2;

		const emojiReplacePatch = this.emojiReplacePatch.bind(this);
		inject('replace-on-send', message, 'sendMessage', emojiReplacePatch, true);
	}

	emojiReplacePatch(args) {
		const message = args[1];
		const emojies = message.validNonShortcutEmojis;

		emojies.forEach((emoji) => {
			// skip discord emojies
			if (!emoji.require_colons) return;

			// create the emoji string which we will replace
			const emojiString = `<${emoji.animated ? 'a' : ''}:${emoji.name}:${
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
