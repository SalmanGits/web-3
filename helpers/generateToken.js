const jwt = require('jsonwebtoken');
const createUserToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.EXPIRES });
  return token;
}

module.exports = createUserToken
