const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { authenticate, jwtKey } = require('../auth/authenticate');
const Users = require('./users-model.js');

module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};

function register(req, res) {
  // implement user registration
  let user = req.body;
  const hash = bcrypt.hashSync(user.password, 12);
  user.password = hash;

  Users
    .add(user).then(users => {
      res.status(201).json(user)
    })
    .catch(err => {
      res.status(500).json({ message: 'User not registed' });
    })
}

/*function login(req, res) {
  // implement user login
  let { username, password } = req.body;

  Users.findBy({ username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        const token = generateToken(user);

        res.status(200).json({ message: `Welcome ${user.username}!`, token, });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    })
    .catch(err => {
      res.status(500).json(err)
    })
}*/
function login(req, res) {
  // implement user login
  const { username, password } = req.body;

  Users.findBy({ username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        const token = generateToken(user);

        res.status(200).json({ message: `Welcome ${user.username}!`, token });
      } else {
        res.status(401).json({ message: "You shall not pass!" });
      }
    })
    .catch(error => {
      res.status(500).json({ message: "We ran into an error retreving the specified request." });
    });
}

function generateToken(user) {
  const payload = {
    userId: user.id,
    username: user.username,
  };

  const options = {
    expiresIn: '1h',
  };

  return jwt.sign(payload, jwtKey, options);
}

function getJokes(req, res) {
  const requestOptions = {
    headers: { accept: 'application/json' },
  };

  axios
    .get('https://icanhazdadjoke.com/search', requestOptions)
    .then(response => {
      res.status(200).json(response.data.results);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
}
