import express from "express";
import helmet from "helmet";
import menuRouter from './routes/menu';
import bodyParser from 'body-parser';
import mongoSanitize from 'express-mongo-sanitize';

const app = express()

app.use(bodyParser.json());
app.use(helmet())
app.use(mongoSanitize());

//menu route
app.use('/menu', menuRouter)

// start server
let PORT = 8085

export let server = app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
