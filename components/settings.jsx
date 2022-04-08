const { React } = require('powercord/webpack');
const { SliderInput, SwitchItem } = require('powercord/components/settings');

module.exports = class NitroBypassSettings extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<>
				<SliderInput
					note="Choose the size of emojis."
					minValue={16}
					maxValue={128}
					stickToMarkers
					initialValue={this.props.getSetting('size', 64)}
					onValueChange={(size) => this.props.updateSetting('size', size)}
					markers={[16, 20, 32, 48, 64, 128]}
				>
					Emoji size
				</SliderInput>
				<SwitchItem
					note="Also replaces non-animated emojis of the current guild with links."
					value={this.props.getSetting('spoofAvailableEmojis', false)}
					onChange={() => this.props.toggleSetting('spoofAvailableEmojis')}
				>
					Spoof available emojis
				</SwitchItem>
			</>
		);
	}
};
