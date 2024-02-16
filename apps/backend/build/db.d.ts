import {Status, UserBase, WorkoutBase} from '@dundring/types';
import {
	FitnessData,
	PrismaClient,
	SteadyWorkoutPart,
	User,
	Workout,
} from '@prisma/client';
export declare const prisma: PrismaClient<
	import('.prisma/client').Prisma.PrismaClientOptions,
	never,
	| import('.prisma/client').Prisma.RejectOnNotFound
	| import('.prisma/client').Prisma.RejectPerOperation
	| undefined
>;
export declare const getUserByUsername: (username: string) => Promise<
	Status<
		User & {
			fitnessData: FitnessData | null;
		},
		'User not found' | 'Something went wrong reading from database'
	>
>;
export declare const getUserByMail: (
	mail: string,
) => Promise<
	Status<User, 'User not found' | 'Something went wrong reading from database'>
>;
export declare const createUser: (
	user: UserBase,
) => Promise<
	Status<
		User,
		| 'Username is already in use'
		| 'Mail is already in use'
		| 'Something went wrong writing to database'
	>
>;
export declare const getUserWorkouts: (userId: string) => Promise<
	Status<
		(Workout & {
			parts: SteadyWorkoutPart[];
		})[],
		'Something went wrong while reading workouts from database'
	>
>;
export declare const getWorkout: (id: string) => Promise<
	Status<
		Workout & {
			parts: SteadyWorkoutPart[];
		},
		'Workout not found' | 'Something went wrong reading from database'
	>
>;
export declare const upsertFitnessData: (
	userId: string,
	fitnessData: {
		ftp: number;
	},
) => Promise<
	Status<FitnessData, 'Something went wrong while writing to database'>
>;
export declare const getFitnessData: (
	userId: string,
) => Promise<
	Status<
		FitnessData,
		'Something went wrong while reading from database' | 'No data found'
	>
>;
export declare const upsertWorkout: (
	userId: string,
	workout: WorkoutBase,
	workoutId?: string,
) => Promise<
	Status<
		Workout & {
			parts: SteadyWorkoutPart[];
		},
		'Something went wrong while upserting workout'
	>
>;
//# sourceMappingURL=db.d.ts.map
