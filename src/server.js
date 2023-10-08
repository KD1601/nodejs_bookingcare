import express from "express";
import bodyParser from "body-parser";
import viewEngine from "./config/viewEngine";
import initWebRoutes from './route/web';
import connect from './config/connectDB'
import cors from 'cors'

require('dotenv').config();

let app = express();

app.use(cors({ credentials: true, origin: true }));
//config app

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))

viewEngine(app);
initWebRoutes(app);

// Connect to DB
connect()

let port = process.env.PORT || 6969;
//Port === undefined => port = 6969

app.listen(port, () => {
    //callback
    console.log("Backend Nodejs is runing on the port : " + port)
})
