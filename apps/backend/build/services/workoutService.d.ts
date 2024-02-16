import {Status, Workout, WorkoutBase} from '@dundring/types';
export declare const getWorkout: (
	workoutId: string,
) => Promise<
	Status<
		Workout,
		'Workout not found' | 'Something went wrong reading from database'
	>
>;
export declare const getUserWorkouts: (
	userId: string,
) => Promise<
	Status<Workout[], 'Something went wrong while reading workouts from database'>
>;
export declare const upsertWorkout: (
	userId: string,
	workout: WorkoutBase,
	workoutId?: string,
) => Promise<Status<Workout, 'Something went wrong while upserting workout'>>;
//# sourceMappingURL=workoutService.d.ts.map
