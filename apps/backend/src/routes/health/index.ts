import * as express from 'express';

const router = express.Router();

router.get<null, {}>('/', (_req, res) => {
	res.send({
		status: 'ok',
		info: {
			pod: process.env.POD,
			version: process.env.TAG,
		},
	});
});

export default router;
