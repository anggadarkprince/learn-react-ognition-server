/* node js simple server
const http = require('http');

const server = http.createServer((request, response) => {
    console.log(request.headers);
    console.log(request.method);
    console.log(request.url);
    response.setHeader('Content-Type', 'text/html');
    response.end('<h1>Hello</h1>');
});

server.listen(3000);
*/

const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use((req, res, next) => {
    console.log('check request');
    next();
});

app.get('/', (req, res) => {
    res.send('Index');
});

app.get('/profile', (req, res) => {
    const user = {
        name: 'Angga',
        username: 'anggadarkprince'
    }
    res.send(JSON.stringify(user));
});

// post http://localhost:3000/register/admin?user=angga
app.post('/register/:type', (req, res) => {
    console.log(req.query);
    console.log(req.body);
    console.log(req.headers);
    console.log(req.params);
    res.status(200).send('Create new user');
});

app.listen(3000, () => console.log('Example app listening on port 3000!'));










