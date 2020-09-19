import dotenv from 'dotenv';
import Koa from 'koa';
import Router from 'koa-router';
import Api from './api';
import jwtMiddleware from './lib/jwtMiddleware';
import bodyParser from 'koa-bodyparser';
import mongoose from 'mongoose';

const app = new Koa();
const router = new Router();

dotenv.config();
router.use('/api', Api.routes());
const { PORT, MONGO_URI, MONGO_ID, MONGO_PWD } = process.env;

app.use(bodyParser());
app.use(jwtMiddleware);
app.use(router.routes()).use(router.allowedMethods());

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    user: MONGO_ID,
    pass: MONGO_PWD,
}).then(() => {
    console.log('Connected to MongoDB');
});

app.listen(PORT, () => {
    console.log(`Listening to port ${PORT}`);
})