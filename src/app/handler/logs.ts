import { Request, Response } from 'express';

import { db } from '../../core/mongodb.js';

export async function listLogsHandler(request: Request, response: Response): Promise<void> {
    const logs = await db.collection('logs').find().toArray();

    response.json(logs);
}
