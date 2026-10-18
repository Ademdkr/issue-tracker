import { config } from 'dotenv';
import { resolve } from 'path';

// Explicit process variables take precedence over the local root .env file.
config({ path: resolve(__dirname, '../../.env'), quiet: true });
