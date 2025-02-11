import { ConsumeMessage } from "amqplib";

import env from "./core/env.js";
import { amqp, queue } from "./core/amqp.js";
import { db, mongodb } from "./core/mongodb.js";

export async function handleMessage(message: ConsumeMessage | null): Promise<void> {
    if (!message) {
        return;
    }

    console.log(`Received message from queue ${queue}.`);
    amqp.ack(message);

    const { carId, timestamp } = JSON.parse(message.content.toString());
    db.collection("logs").insertOne({ source: 'queue', event: 'message', createdAt: timestamp, processedAt: Date.now(), carId });

    try {
        const res = await fetch(env.BHUT_WEBHOOK_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ carId, timestamp }),
        });

        db.collection("logs").insertOne({ source: 'webhook', event: 'response', processedAt: Date.now(), carId, status: res.status });
    } catch (err) {
        db.collection("logs").insertOne({ source: 'webhook', event: 'error', processedAt: Date.now(), carId, error: err instanceof Error ? err.message : err });
    }
}

await mongodb.connect();
amqp.consume(queue, handleMessage);

process.on('exit', async () => {
    await mongodb.close();
});
