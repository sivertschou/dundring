import {Workout} from '@dundring/types';

export const defaultWorkouts: Workout[] = [
	{
		name: '4x4min @ 110% FTP',
		parts: [
			{
				duration: 300,
				targetPower: 50,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 60,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 70,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 80,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 90,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 100,
				type: 'steady',
			},
			{
				duration: 120,
				targetPower: 60,
				type: 'steady',
			},
			{
				duration: 240,
				targetPower: 110,
				type: 'steady',
			},
			{
				duration: 120,
				targetPower: 65,
				type: 'steady',
			},
			{
				duration: 240,
				targetPower: 110,
				type: 'steady',
			},
			{
				duration: 120,
				targetPower: 65,
				type: 'steady',
			},
			{
				duration: 240,
				targetPower: 110,
				type: 'steady',
			},
			{
				duration: 120,
				targetPower: 65,
				type: 'steady',
			},
			{
				duration: 240,
				targetPower: 110,
				type: 'steady',
			},
			{
				duration: 360,
				targetPower: 60,
				type: 'steady',
			},
		],
		id: '', // needs '' as id to correctly save in localStorage when user edits the workout
	},
	{
		name: '3x10 min @ 92% FTP - Threshold intervals',
		parts: [
			{
				duration: 300,
				targetPower: 60,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 80,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 70,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 90,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 70,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 100,
				type: 'steady',
			},
			{
				duration: 120,
				targetPower: 70,
				type: 'steady',
			},
			{
				duration: 600,
				targetPower: 92,
				type: 'steady',
			},
			{
				duration: 120,
				targetPower: 70,
				type: 'steady',
			},
			{
				duration: 600,
				targetPower: 92,
				type: 'steady',
			},
			{
				duration: 120,
				targetPower: 70,
				type: 'steady',
			},
			{
				duration: 600,
				targetPower: 92,
				type: 'steady',
			},
			{
				duration: 240,
				targetPower: 60,
				type: 'steady',
			},
		],
		id: '',
	},
	{
		name: 'Easy Z1-Z2 (60-75% FTP) - 1 Hour',
		parts: [
			{
				duration: 300,
				targetPower: 60,
				type: 'steady',
			},
			{
				duration: 300,
				targetPower: 65,
				type: 'steady',
			},
			{
				duration: 300,
				targetPower: 70,
				type: 'steady',
			},
			{
				duration: 300,
				targetPower: 75,
				type: 'steady',
			},
			{
				duration: 300,
				targetPower: 60,
				type: 'steady',
			},
			{
				duration: 300,
				targetPower: 65,
				type: 'steady',
			},
			{
				duration: 300,
				targetPower: 70,
				type: 'steady',
			},
			{
				duration: 300,
				targetPower: 75,
				type: 'steady',
			},
			{
				duration: 300,
				targetPower: 60,
				type: 'steady',
			},
			{
				duration: 300,
				targetPower: 65,
				type: 'steady',
			},
			{
				duration: 300,
				targetPower: 70,
				type: 'steady',
			},
			{
				duration: 300,
				targetPower: 75,
				type: 'steady',
			},
		],
		id: '',
	},
	{
		name: 'Ramp test (FTP should be set to 100 for this workout)',
		parts: [
			{
				duration: 60,
				targetPower: 100,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 120,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 140,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 160,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 180,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 200,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 220,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 240,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 260,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 280,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 300,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 320,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 340,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 360,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 380,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 400,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 420,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 440,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 460,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 480,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 500,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 520,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 540,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 560,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 580,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 600,
				type: 'steady',
			},
			{
				duration: 600,
				targetPower: 150,
				type: 'steady',
			},
		],
		id: '',
	},
	{
		name: '10x1min - 117% - 140% FTP',
		parts: [
			{
				duration: 300,
				targetPower: 70,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 80,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 90,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 100,
				type: 'steady',
			},
			{
				duration: 120,
				targetPower: 70,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 117,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 70,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 120,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 70,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 122,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 70,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 125,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 70,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 127,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 70,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 130,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 70,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 132,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 70,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 135,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 70,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 137,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 70,
				type: 'steady',
			},
			{
				duration: 60,
				targetPower: 140,
				type: 'steady',
			},
			{
				duration: 360,
				targetPower: 60,
				type: 'steady',
			},
		],
		id: '',
	},
];
