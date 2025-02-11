import { Request, Response } from 'express';

import { amqp, queue } from '../../core/amqp.js';
import { createCar, getCars } from '../../core/api.js';
import { redis } from '../../core/redis.js';

import { CarValidator } from '../validators/car.js';

const REDIS_CACHE_KEY = "bhut_cars";

export async function listCarsHandler(request: Request, response: Response): Promise<void> {
    if (await redis.exists(REDIS_CACHE_KEY)) {
        const cars = JSON.parse((await redis.get(REDIS_CACHE_KEY))!);
        response.json(cars);
        return;
    }

    const cars = await getCars();
    await redis.set(REDIS_CACHE_KEY, JSON.stringify(cars), { EX: 5 });

    response.json(cars);
}

export async function createCarHandler(request: Request, response: Response): Promise<void> {
    const car = CarValidator.parse(request.body);

    const carId = await createCar(car);
    await redis.del(REDIS_CACHE_KEY);

    amqp.sendToQueue(queue, Buffer.from(JSON.stringify({ carId, timestamp: Date.now() })));

    response.status(201).json({ id: carId });
}
