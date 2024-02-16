import {AreaChart, YAxis, Tooltip, Area, ResponsiveContainer} from 'recharts';
import {CustomGraphTooltip} from './Graph/CustomGraphTooltip';
import {hrColors, powerColors, untrackedColor} from '../colors';
import {ShowData} from './Graph/GraphContainer';
import React from 'react';

const fillAreaChart = (
	dataPrefix: string,
	checked: ShowData,
	index: number,
	showFill: boolean,
	type: 'hr' | 'power',
	isUntracked: boolean = false,
) => {
	const hrColor = isUntracked
		? untrackedColor
		: hrColors[index % hrColors.length];
	const powerColor = isUntracked
		? untrackedColor
		: powerColors[index % powerColors.length];
	const hrGradientId = dataPrefix + 'colorHR';
	const powerGradientId = dataPrefix + 'colorPower';
	const showHr = type === 'hr' && checked.hr;
	const showPower = type === 'power' && checked.power;
	return (
		<React.Fragment key={index}>
			{showFill ? (
				<defs>
					{showHr ? (
						<linearGradient id={`${hrGradientId}`} x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor={hrColor} stopOpacity={0.4} />
							<stop offset="95%" stopColor={hrColor} stopOpacity={0} />
						</linearGradient>
					) : null}
					{showPower ? (
						<linearGradient
							id={`${powerGradientId}`}
							x1="0"
							y1="0"
							x2="0"
							y2="1"
						>
							<stop offset="5%" stopColor={powerColor} stopOpacity={0.4} />
							<stop offset="95%" stopColor={powerColor} stopOpacity={0} />
						</linearGradient>
					) : null}
				</defs>
			) : null}

			{showHr ? (
				<Area
					dataKey={`${dataPrefix} HR`}
					stroke={hrColor}
					fill={`url(#${hrGradientId})`}
					animationDuration={0}
					width={20}
				/>
			) : null}
			{showPower ? (
				<Area
					dataKey={`${dataPrefix} Power`}
					stroke={powerColor}
					fill={`url(#${powerGradientId})`}
					animationDuration={0}
					width={20}
				/>
			) : null}
		</React.Fragment>
	);
};

export type DataPoint<T extends string = string> = Record<
	`${T} ${'HR' | 'Power'}`,
	number | undefined
>;

interface Props {
	allMerged: DataPoint[];
	otherUsers: string[];
	showOtherUsersData: {[username: string]: ShowData};
	showUserData: ShowData;
	showFill: boolean;
}

export const PowerChart = ({
	allMerged,
	otherUsers,
	showOtherUsersData,
	showUserData,
	showFill,
}: Props) => {
	return (
		<ResponsiveContainer width="100%">
			<AreaChart data={allMerged}>
				{otherUsers.map((username, i) =>
					fillAreaChart(
						username,
						showOtherUsersData[username] || {
							hr: true,
							power: true,
						},
						i + 1,
						showFill,
						'power',
					),
				)}
				{fillAreaChart(
					'You-Untracked',
					showUserData,
					0,
					showFill,
					'power',
					true,
				)}
				{fillAreaChart('You', showUserData, 0, showFill, 'power')}
				{otherUsers.map((username, i) =>
					fillAreaChart(
						username,
						showOtherUsersData[username] || {
							hr: true,
							power: true,
						},
						i + 1,
						showFill,
						'hr',
					),
				)}
				{fillAreaChart('You', showUserData, 0, showFill, 'hr')}
				{fillAreaChart('You-Untracked', showUserData, 0, showFill, 'hr', true)}

				<YAxis />
				<Tooltip content={<CustomGraphTooltip />} />
			</AreaChart>
		</ResponsiveContainer>
	);
};
