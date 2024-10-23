import express from 'express';
import cors from 'cors';
import standardRouter from './routes/standard';
import historyRouter from './routes/history';
import morgan from 'morgan';
import resultRouter from './routes/result'

const app = express();

app.use(cors());
app.use(express.json());

app.use(morgan('dev'));


const PORT = process.env.PORT || 5000;

app.use('/api/standard', standardRouter);
app.use('/api/history', historyRouter)
app.use('/api/result', resultRouter)

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});