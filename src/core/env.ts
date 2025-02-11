import { z } from 'zod';

const envSchema = z.object({
    NODE_ENV: z.string().optional().default('PRODUCTION'),
    PORT: z.coerce.number().max(65535).optional().default(3000),

    DATABASE_URL: z.string(),

    REDIS_URL: z.string(),

    AMQP_URL: z.string(),
    AMQP_QUEUE: z.string(),

    BHUT_URL: z.string(),
    BHUT_WEBHOOK_URL: z.string(),
    BHUT_USERNAME: z.string(),
    BHUT_PASSWORD: z.string(),
});

export default envSchema.parse(process.env);
