import express from "express";
import helmet from "helmet";
import menuRouter from './routes/menu';

const app = express()

app.use(express.json());
app.use(helmet())

//menu route
app.use('/menu', menuRouter)

// start server
let PORT = 8085

export let server = app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
