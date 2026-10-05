import { neon } from "@neondatabase/serverless";

const NEON_DB_URL = `postgresql://neondb_owner:${process.env.NEON_TOKEN}@ep-falling-sound-b1qia9oa-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`;

export const sql = neon(NEON_DB_URL);