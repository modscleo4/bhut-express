import express from 'express';

import env from './core/env.js';
import { mongodb } from './core/mongodb.js';
import { redis } from './core/redis.js';

import { createCarHandler, listCarsHandler } from './app/handler/car.js';
import { listLogsHandler } from './app/handler/logs.js';

const app = express();
app.use(express.json());

app.get('/api/car', listCarsHandler);
app.post('/api/car', createCarHandler);
app.get('/api/logs', listLogsHandler);

app.listen(env.PORT, async () => {
    console.log(`Server is running on port ${env.PORT}`);

    await mongodb.connect();
    await redis.connect();
});

app.on('close', async () => {
    await mongodb.close();
    await redis.disconnect();
});
