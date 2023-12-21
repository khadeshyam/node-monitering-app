import express from 'express';
import responseTime from 'response-time';
import { collectDefaultMetrics, register, Histogram, Counter } from 'prom-client';
import { heavyTask } from './util.js';

const app = express();
const PORT = process.env.PORT || 8000;

collectDefaultMetrics();

const reqResTime = new Histogram({
	name: 'http_express_req_res_time',
	help: 'Request response time',
	labelNames: ['method', 'route', 'status_code'],
	buckets: [1, 50, 100, 200, 400, 500, 800, 1000,2000]
});

const totalRequestCounter = new Counter({
	name: 'total_req',
	help: 'Tells total request'
});

app.use(responseTime((req, res, time) => {
	if (!req.headers['user-agent'].includes('Prometheus')) {
		totalRequestCounter.inc();
	}
	reqResTime.labels({
		method: req.method,
		route: req.url,
		status_code: res.statusCode
	}).observe(time);
}
));

app.get('/', (req, res) => {
	res.json({ message: 'Hello World!' });
});


app.get('/slow', async (req, res) => {
	try {
		const result = await heavyTask();
		res.json(result);
	} catch (err) {
		res.status(500).json(err);
	}
});

app.get('/metrics', async (req, res) => {

	res.set('Content-Type', register.contentType);
	const metrics = await register.metrics();
	res.end(metrics);
});

app.listen(PORT, () => {
	console.log(`App listening at http://localhost:${PORT}`);
});