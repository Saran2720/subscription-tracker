import { config } from 'dotenv';

const NODE_ENV = process.env.NODE_ENV || 'development';

// Try common dotenv conventions; missing files won't crash (dotenv just returns an error object)
config({ path: `.env.${NODE_ENV}.local` });
config({ path: `.env.${NODE_ENV}` });
config();

export const { PORT,SERVER_URL, DB_URI, JWT_SECRET, JWT_EXPIRES_IN, ARCJET_KEY, ARCJET_ENV, QSTASH_URL, QSTASH_TOKEN } = process.env;
export { NODE_ENV };