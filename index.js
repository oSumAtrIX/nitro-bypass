const { Plugin } = require('powercord/entities');
const { React, getModule } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');

const Settings = require('./components/settings.jsx');

module.exports = class NitroBypass extends Plugin {
	async startPlugin() {
		powercord.api.settings.registerSettings(this.entityID, {
			category: this.entityID,
			label: 'NitroBypass',
			render: Settings,
		});

		const message = await getModule(['sendMessage', 'editMessage']);
		const currentUser = await getModule(['getCurrentUser']);

		// spoof client side premium
		currentUser.getCurrentUser().premiumType = 2;

		const emojieReplacePatch = this.emojieReplacePatch.bind(this);
		inject('replace-on-send', message, 'sendMessage', emojieReplacePatch, true);
	}

	emojieReplacePatch(args) {
		const message = args[1];
		const emojies = message.validNonShortcutEmojis;

		emojies.forEach((emoji) => {
			// skip discord emojies
			if (!emoji.require_colons) return;

			// create the emojie string which we will replace
			const emoteString = `<${emoji.animated ? 'a' : ''}:${emoji.name}:${
				emoji.id
			}>`;

			const emojiUrl = emoji.url;

			// change the size of the emojie in the url
			const emojiSize = this.settings.get('size', 48);
			if (emojiSize != 48) {
				emojiUrl = emojiUrl.replace(/\?size=[0-9]+/, `?size=${emojiSize}`);
			}

			// replace the message containing the emojie with the url
			message.content = message.content.replace(emoteString, emojiUrl);
		});

		return args;
	}

	pluginWillUnload() {
		powercord.api.settings.unregisterSettings(this.entityID);

		uninject('replace-on-send');
	}
};
