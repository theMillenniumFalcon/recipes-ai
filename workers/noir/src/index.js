import actionsObj from './actions';

export default {
	async fetch(request, env, ctx) {
		return new Response('Hello from noir worker');
	},
	async scheduled(event, env, ctx) {
		console.log('Cron job executed at:', new Date().toISOString());

		// await actionsObj.cleanHangingImages((24 * 60 * 60 * 1000), env); // olderThan = 1 day
		// await actionsObj.cleanSuccessfulLogs((24 * 60 * 60 * 1000), env); // olderThan = 1 day
		// await actionsObj.cleanUnsuccessfulLogs((30 * 24 * 60 * 60 * 1000), env); // olderThan = 1 month
		
		return new Response('Cron job executed successfully!');
	}
};
