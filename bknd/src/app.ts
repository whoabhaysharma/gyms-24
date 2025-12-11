import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from '@routes';

const app = express();

// Middleware
app.use(express.json({
    verify: (req: any, _res, buf) => {
        req.rawBody = buf;
    }
}));
app.use(express.urlencoded({ extended: true }));
// app.use(cors({
//     origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//     credentials: true
// }));
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Gyms24 Backend is running smoothly',
        timestamp: new Date().toISOString(),
        service: 'gyms24-backend'
    });
});

export default app;
