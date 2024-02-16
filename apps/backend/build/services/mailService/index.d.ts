import {Status} from '@dundring/types';
export declare const checkMailConfig: () => void;
export declare const sendLoginOrRegisterMail: (
	mail: string,
) => Promise<
	Status<
		'Login link sent' | 'Register link sent',
		'Something went wrong while sending the e-mail'
	>
>;
//# sourceMappingURL=index.d.ts.map
