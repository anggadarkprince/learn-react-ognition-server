const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const account = require('./controllers/account');
const profile = require('./controllers/profile');
const image = require('./controllers/image');
const authorization = require('./controllers/authorization');

const db = knex({
    client: 'pg',
    connection: {
        connectionString: process.env.POSTGRES_URI,
        //ssl: true
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

app.post('/register', account.handleRegister(db, bcrypt));

app.post('/signin', (req, res) => {
    account.signInAuthentication(db, bcrypt)(req, res);
});

app.get('/profile/:id', authorization.requireAuth, (req, res) => {
    profile.getProfile(req, res, db)
});

app.post('/profile/:id', authorization.requireAuth, (req, res) => {
    profile.handleProfileUpdate(req, res, db, bcrypt)
});

app.put('/update-entry', authorization.requireAuth, (req, res) => {
    image.updateEntries(req, res, db);
});

app.post('/detect-face', authorization.requireAuth, (req, res) => {
    image.handleApiCall(req, res);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`App is listening on port ${PORT}`));