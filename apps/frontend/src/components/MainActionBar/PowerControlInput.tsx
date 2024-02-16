import * as React from 'react';
import {
	Button,
	FormControl,
	Grid,
	GridItem,
	Input,
	InputGroup,
	InputRightAddon,
	Tooltip,
} from '@chakra-ui/react';
import {useActiveWorkout} from '../../context/ActiveWorkoutContext';
import {useSmartTrainer} from '../../context/SmartTrainerContext';
import {
	ftpPercentFromWatt,
	parseFtpPercentInput,
	parseWattInput,
	wattFromFtpPercent,
} from '../../utils/general';

interface PowerInputData {
	power: number | null;
	wattInput: string;
	percentInput: string;
}

export const PowerControlInput = () => {
	const {activeFtp} = useActiveWorkout();
	const {
		isConnected: smartTrainerIsConnected,
		setResistance: setSmartTrainerResistance,
	} = useSmartTrainer();

	const [powerInputData, dispatchPowerInputAction] = React.useReducer(
		(
			_currentData: PowerInputData,
			action: {value: string; type: 'watt' | 'ftp'; activeFtp: number},
		): PowerInputData => {
			switch (action.type) {
				case 'ftp': {
					const ftpPercent = parseFtpPercentInput(action.value);

					if (ftpPercent === null || ftpPercent < 0)
						return {
							power: null,
							percentInput: action.value,
							wattInput: '',
						};

					const watt = wattFromFtpPercent(ftpPercent, action.activeFtp);
					return {
						power: ftpPercent,
						percentInput: action.value,
						wattInput: '' + watt,
					};
				}
				case 'watt': {
					const watt = parseWattInput(action.value);

					if (watt === null || watt < 0)
						return {
							power: null,
							wattInput: action.value,
							percentInput: '',
						};

					const ftpPercent = ftpPercentFromWatt(watt, action.activeFtp);
					return {
						power: ftpPercent,
						wattInput: action.value,
						percentInput: '' + ftpPercent,
					};
				}
			}
		},
		{
			power: 100,
			wattInput: '' + activeFtp,
			percentInput: '100',
		},
	);

	React.useEffect(() => {
		dispatchPowerInputAction({
			type: 'ftp',
			value: '100',
			activeFtp,
		});
	}, [activeFtp]);

	return (
		<Grid
			templateColumns="1fr 1fr 1fr"
			templateRows="1fr 1fr"
			width="10em"
			gap="1"
		>
			<GridItem colSpan={2} rowSpan={1}>
				<FormControl
					isInvalid={powerInputData.power === null}
					isDisabled={!smartTrainerIsConnected}
				>
					<InputGroup size="sm">
						<Input
							placeholder="Watt"
							type="number"
							value={powerInputData.wattInput}
							onChange={e =>
								dispatchPowerInputAction({
									type: 'watt',
									value: e.target.value,
									activeFtp: activeFtp,
								})
							}
						/>
						<Tooltip
							label="Watt"
							placement="top"
							isDisabled={!smartTrainerIsConnected}
						>
							<InputRightAddon children="W" />
						</Tooltip>
					</InputGroup>
				</FormControl>
			</GridItem>
			<GridItem colSpan={1} rowSpan={2}>
				<Tooltip
					label={
						powerInputData.power !== null
							? `Set resistance to ${wattFromFtpPercent(
									powerInputData.power,
									activeFtp,
							  )}W (${powerInputData.power}% of FTP)`
							: 'Set resistance'
					}
					placement="top"
				>
					<Button
						isDisabled={
							!smartTrainerIsConnected || powerInputData.power === null
						}
						height="100%"
						width="100%"
						onClick={() => {
							if (!smartTrainerIsConnected || powerInputData.power === null)
								return;

							setSmartTrainerResistance(
								wattFromFtpPercent(powerInputData.power, activeFtp),
							);
						}}
					>
						Set
					</Button>
				</Tooltip>
			</GridItem>
			<GridItem colSpan={2} rowSpan={1}>
				<FormControl
					isInvalid={powerInputData.power === null}
					isDisabled={!smartTrainerIsConnected}
				>
					<InputGroup size="sm">
						<Input
							placeholder="%FTP"
							type="number"
							value={powerInputData.percentInput}
							onChange={e =>
								dispatchPowerInputAction({
									type: 'ftp',
									value: e.target.value,
									activeFtp: activeFtp,
								})
							}
						/>
						<Tooltip
							label={`% of FTP (${activeFtp}W)`}
							placement="bottom"
							isDisabled={!smartTrainerIsConnected}
						>
							<InputRightAddon children="%" />
						</Tooltip>
					</InputGroup>
				</FormControl>
			</GridItem>
		</Grid>
	);
};
