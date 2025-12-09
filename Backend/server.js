import dotenv from 'dotenv';
import express from 'express';
import { InferenceClient } from "@huggingface/inference";

import cors from 'cors';

dotenv.config();
const port = process.env.PORT || 8000;

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded());

const client = new InferenceClient(process.env.HF_TOKEN);

app.post('/analyse', async (req, res, next) => {
  if (!req.body || !req.body.text) {
    const err = new Error('No text to analyse.');
    err.status = 400;
    next(err);
  }
  const text = req.body.text;
  try {
    const output = await client.textClassification({
      model: "tabularisai/multilingual-sentiment-analysis",
      inputs: text,
      provider: "hf-inference",
    });
    const top = output.reduce((prev, curr) => (curr.score > prev.score ? curr : prev));
    res.json(top);
  } catch (e) {
    console.error(e);
    next(e);
  }
});

app.use((err, req, res, next) => {
  if (err.status) {
    res.status(err.status).json({ msg: err.message });
  }
  else {
    res.status(500).json({ msg: err.message });
  }
});

app.listen(port,'0.0.0.0', () => { console.log('Server running...') });