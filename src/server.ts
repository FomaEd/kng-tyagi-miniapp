import express from 'express';
import cors from 'cors';
import path from 'path';
import { calculateTraction, UserInput } from './calculator';

const app = express();
const port = 3000;

const publicDir = path.join(__dirname, '..', 'public');

app.use(express.json());
app.use(cors());
app.use(express.static(publicDir));

app.post('/api/calculate', (req, res) => {
  const body = req.body as Partial<UserInput>;

  if (
    typeof body.width !== 'number' ||
    typeof body.height !== 'number' ||
    !body.series ||
    !body.hinge
  ) {
    return res.status(400).json({
      error: 'Некорректные входные данные',
      got: body
    });
  }

  const result = calculateTraction(body as UserInput);

  // вернём ещё и вход, чтобы видеть height в ответе
  res.json({
    input: body,
    result
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
