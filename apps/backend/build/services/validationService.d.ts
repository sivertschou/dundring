import {Request, Response} from 'express';
import {ApiResponseBody, Status} from '@dundring/types';
export declare const hash: (message: string) => string;
interface Mailtoken {
	timestamp: Date;
	mail: string;
}
export declare const generateAccessToken: (user: UserPayload) => string;
export declare const generateMailToken: (mail: string) => string;
export declare const getMailTokenData: (
	token: string,
) => Status<Mailtoken, 'Token expired' | 'Token not found'>;
export declare type AuthenticatedRequest<T> = {
	username: string;
	userId: string;
	jwtPayload: JwtExpPayload;
} & Request<T>;
interface UnauthenticatedRequest<T> extends Request<T> {
	username?: string;
	userId?: string;
	jwtPayload?: JwtExpPayload;
}
interface UserPayload {
	username: string;
	userId: string;
}
interface JwtExpPayload {
	expiresIn: string;
	exp: number;
}
export declare const authenticateToken: <Res, Req>(
	req: UnauthenticatedRequest<Req>,
	res: Response<ApiResponseBody<Res>, Record<string, any>>,
) => req is AuthenticatedRequest<Req>;
export {};
//# sourceMappingURL=validationService.d.ts.map
