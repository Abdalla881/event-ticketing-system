import { Global, Module } from '@nestjs/common';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

@Global()
@Module({
  providers: [
    {
      provide: 'DATABASE_POOL',
      useFactory: async () => {
        const pool = new Pool({
          host: process.env.POSTGRES_HOST,
          port: parseInt(process.env.POSTGRES_PORT || '5432'),
          user: process.env.POSTGRES_USER,
          password: process.env.POSTGRES_PASSWORD,
          database: process.env.POSTGRES_DB,
        });

        try {
          await pool.query('SELECT 1');
          console.log('✅ PostgreSQL connected successfully');
          return pool;
        } catch (error) {
          console.error('❌ Failed to connect to PostgreSQL');
          console.error(error);
          process.exit(1);
        }
      },
    },
  ],
  exports: ['DATABASE_POOL'],
})
export class DataBaseModule {}
