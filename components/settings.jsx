const { React } = require('powercord/webpack');
const { SliderInput } = require('powercord/components/settings');

module.exports = class NitroBypassSettings extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<>
				<SliderInput
					note="The size of the emotes."
					minValue={16}
					maxValue={128}
					stickToMarkers
					initialValue={this.props.getSetting('size', 64)}
					onValueChange={(size) => this.props.updateSetting('size', size)}
					markers={[16, 20, 32, 48, 64, 128]}
				>
					Emote size
				</SliderInput>
			</>
		);
	}
};
