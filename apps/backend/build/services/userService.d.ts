import {Status, UserBase} from '@dundring/types';
import {User} from '@prisma/client';
export declare const getUser: (username: string) => Promise<
	Status<
		User & {
			fitnessData: import('.prisma/client').FitnessData | null;
		},
		'User not found' | 'Something went wrong reading from database'
	>
>;
export declare const getUserByMail: (
	mail: string,
) => Promise<
	Status<User, 'User not found' | 'Something went wrong reading from database'>
>;
export declare const getUserWorkoutsByUserId: (userId: string) => Promise<
	Status<
		(import('.prisma/client').Workout & {
			parts: import('.prisma/client').SteadyWorkoutPart[];
		})[],
		'Something went wrong while reading workouts from database'
	>
>;
export declare const updateUserFtp: (
	userId: string,
	ftp: number,
) => Promise<
	Status<
		import('.prisma/client').FitnessData,
		'Something went wrong while writing to database'
	>
>;
export declare const getUserFitnessData: (
	userId: string,
) => Promise<
	Status<
		import('.prisma/client').FitnessData,
		'Something went wrong while reading from database' | 'No data found'
	>
>;
export declare const createUser: (
	user: UserBase,
) => Promise<
	Status<
		User,
		| 'Mail is already in use'
		| 'Username is already in use'
		| 'Something went wrong writing to database'
	>
>;
//# sourceMappingURL=userService.d.ts.map
