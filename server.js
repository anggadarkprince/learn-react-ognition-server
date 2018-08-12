const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

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

db.select('*').from('users').then(data => {
    console.log(data);
})

const app = express();

app.use(bodyParser.json());
app.use(cors());

/*
const database = {
    users: [
        {
            id: 1,
            name: 'Angga',
            email: 'angga@mail.com',
            password: '$2a$10$zYXo3B.3p8UCmJ/ayRwZG.HlqABfjYOycIob4pbWS8OCEtIslICjC', // secret
            entries: 2,
            joined: new Date()
        },
        {
            id: 2,
            name: 'Leon',
            email: 'leon@mail.com',
            password: '$2a$10$ZFOH/OOT5aC9/g3vJOCDJOf5QhnvwI6zdIUsGMUofjaDKAeJ7lkry', // secret2
            entries: 3,
            joined: new Date()
        }
    ],
    login: [
        {
            id: 1,
            hash: '',
            email: 'angga@mail.com'
        }
    ]
}
*/

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

    //res.json(database.users);
});

app.post('/register', (req, res) => {
    const {email, name, password} = req.body;
    const hash = bcrypt.hashSync(password);

    db.transaction(trx => {
        return trx
            .insert({password: hash, email: email})
            .into('login')
            .returning('email')
            .then(loginEmail => {
                return trx
                    .insert({name: name, email: loginEmail[0], joined: new Date()})
                    .into('users')
                    .returning('*')
                    .then(users => {
                        return users[0];
                    })
                    .catch(() => 'unable to register');
            })
            .catch(() => 'unable to create credentials');
    })
        .then(function (registeredUser) {
            res.json(registeredUser);
        })
        .catch(function (error) {
            res.status(400).json(error);
        });

    /*
    database.users.push({
        id: database.users.length + 1,
        name: name,
        email: email,
        password: hashedPassword,
        entries: 0,
        joined: new Date()
    });
    res.json(database.users[database.users.length - 1]);
    */
});

app.post('/signin', (req, res) => {
    const {email, password} = req.body;

    db.select('email', 'password').from('login')
        .where('email', '=', email)
        .then(data => {
            if (data.length) {
                if (bcrypt.compareSync(password, data[0].password)) {
                    db.select('*').from('users')
                        .where('email', '=', email)
                        .then(users => {
                            res.json({status: 'success', user: users[0]});
                        })
                        .catch(() => res.status(400).json({status: 'unable to get user'}));
                } else {
                    res.status(201).json({status: 'unauthorized'});
                }
            } else {
                res.status(201).json({status: 'credential not found'});
            }
        });

    /*
    let isFound = false;
    for (let i = 0; i < database.users.length; i++) {
        if (req.body.email === database.users[i].email) {
            isFound = true;
            bcrypt.compare(req.body.password, database.users[i].password, (err, isMatch) => {
                if (!err && isMatch) {
                    return res.json({status: 'success', user: database.users[i]});
                } else {
                    return res.status(201).json({status: 'unauthorized'});
                }
            });
            break;
        }
    }
    if (!isFound) {
        res.status(201).json({status: 'credential not found'});
    }
    */
});

app.get('/profile/:id', (req, res) => {
    const {id} = req.params;
    db.first('*')
        .from('users')
        .where('id', id)
        .then(user => {
            if (user !== undefined) {
                res.json(user);
            } else {
                res.status(404).json('user not found');
            }
        })
        .catch(() => res.status(500).json('something is getting wrong'));

    /*
    let isFound = false;
    database.users.forEach(user => {
        if (user.id == id) {
            isFound = true;
            return res.json(user);
        }
    });
    if (!isFound) {
        res.status(404).json('user not found');
    }
    */
});

app.put('/image', (req, res) => {
    const {id} = req.body;
    db('users').where('id', '=', id)
        .increment('entries', 1)
        .returning('entries')
        .then(entries => {
            if (entries.length) {
                res.json({entries: entries[0]});
            } else {
                res.status(404).json('user not found');
            }
        })
        .catch(() => res.status(500).json('unable to get entries'));

    /*
    let isFound = false;
    database.users.forEach(user => {
        if (user.id == id) {
            isFound = true;
            user.entries++;
            return res.json({
                entries: user.entries
            });
        }
    });
    if (!isFound) {
        res.status(404).json('user not found');
    }
    */
});

app.listen(3300, () => console.log('App is listening on port 3300'));

/*
/                   -> res = this is working
/signin             -> POST = success/fail
/register           -> POST = user
/profile/:userId    -> GET = user
/image              -> PUT = user
 */










