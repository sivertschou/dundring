import {useData} from '../../context/DataContext';
import {Center, Checkbox, Grid, HStack, Text} from '@chakra-ui/react';
import {DownloadTCXButton} from './DownloadTCXButton';
import * as React from 'react';

export const PausedWorkoutButtons = () => {
	const {hasValidData, isRunning} = useData();
	const [includeGPSData, setIncludeGPSData] = React.useState(true);
	if (isRunning || !hasValidData) return null;

	return (
		<Grid templateColumns="1fr 1fr 1fr" gap="1" height="2.5em">
			<Text />
			<Center width="8em">
				<DownloadTCXButton includeGPSData={includeGPSData} />
			</Center>
			<Center>
				<HStack>
					<Checkbox
						isChecked={includeGPSData}
						onChange={e => setIncludeGPSData(e.target.checked)}
					/>
					<Text>GPS data</Text>
				</HStack>
			</Center>
		</Grid>
	);
};
