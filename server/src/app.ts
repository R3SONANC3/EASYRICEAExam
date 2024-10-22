import express from 'express';
import cors from 'cors';
import standardRouter from './routes/standard';
import historyRouter from './routes/history';
import morgan from 'morgan';

const app = express();

app.use(cors());
app.use(express.json());

app.use(morgan('dev'));


const PORT = process.env.PORT || 5000;

app.use('/api/standard', standardRouter);
app.use('/api/history', historyRouter)

app.get('/get', (req,res) => {
    res.json('message:sss')
})


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});