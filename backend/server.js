import express from 'express';
import helmet from 'helmet';
import morgan from'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import {sql} from './config/db.js';
import { aj } from './lib/arcjet.js';
import productRoutes from './routes/productRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000 ;

app.use(express.json()); // Parse JSON request bodies
app.use(cors());
app.use(helmet())//security for http headers
app.use(morgan('dev'))//log the requests

app.use(async (req, res, next) => {
  try {
    const result = await aj.protect(req, {
      requested:1, //specifies that each request consumes 1 token
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        res.status(429).json({ error: 'Too Many Requests - Rate limit exceeded' });
      } else if (decision.reason.isBot()) {
        res.status(403).json({ error: 'Forbidden - Bot access denied' });
      } else {
        res.status(403).json({ error: 'Forbidden - Access denied' });
      }
      return;// Stop further processing
    }

    //check spoofed bots
    if (decision.results.some((result) => result.reason.isBot() && result.reason.isSpoofed())) {
      res.status(403).json({ error: 'Forbidden - Spoofed bot access denied' });
      return; // Stop further processing
    }

     next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error('Error in Arcjet middleware:', error);
    next(error);
  }
});

app.use('/api/products',productRoutes);

async function initDB(){
  try {
    await sql`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      image VARCHAR(255) NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `
    console.log('Database initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
  }

}

initDB().then(() => {
  app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
  });
});