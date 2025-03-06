// src/app.ts
import express, { Application } from 'express';
import bodyParser from "body-parser"; // Alternatively, use express.json()

import pdfRoutes from '../src/routes/pdfRoutes';

const app: Application = express();

app.use(express.json());
app.use(bodyParser.json());


app.use('/pdf', pdfRoutes);

export default app;
