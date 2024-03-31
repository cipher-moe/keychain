import {Router} from '@tsndr/cloudflare-worker-router';
import {Env} from "./types";
import {del, ensureUser, ensureId, get, post} from "./handlers";

const router = new Router<Env, {}, {}>();
router.cors();

router.get('/keys/:host/:user', ensureUser, get);
// router.post('/keys/:host/:user', ensureUser, post);
// router.delete('/keys/:id', ensureId, del);

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		return router.handle(request, env,  ctx);
	},
};
