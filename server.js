const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const register = require('./controllers/auth');
const profile = require('./controllers/profile');
const image = require('./controllers/image');

const db = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        port: '5433',
        user: 'angga',
        password: 'anggaari',
        database: 'smart-brain'
    }
});

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
    db.select('users.name', 'users.email', 'login.password')
        .from('users')
        .join('login', 'users.email', '=', 'login.email')
        .then(users => {
            res.json(users);
        })
        .catch(err => {
            console.log(err);
        });
});

app.post('/register', register.handleRegister(db, bcrypt));

app.post('/signin', (req, res) => {
    register.handleLogin(req, res, db, bcrypt)
});

app.get('/profile/:id', (req, res) => {
    profile.getProfile(req, res, db)
});

app.put('/update-entry', (req, res) => {
    image.updateEntries(req, res, db);
});

app.post('/detect-face', (req, res) => {
    image.handleApiCall(req, res);
});

app.listen(3300, () => console.log('App is listening on port 3300'));