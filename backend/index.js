import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { urlLoggerMiddleware } from './utils/server.js';
import registerEndpoints from './enpoints.js';



const app = express();

app.use(express.json({ limit: '10mb' }))
app.use(cors({
    origin: '*'
}))
app.use(urlLoggerMiddleware)

registerEndpoints(app)

const uri = 'mongodb://0.0.0.0:27017/identity';

mongoose.connect(uri, {})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));



const PORT = process.env.PORT || 8002;

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})