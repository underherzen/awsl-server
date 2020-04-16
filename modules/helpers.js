const {Session} = require('../models');

const retrieveToken = async headers => {
  let token = headers.authorization;
  if (!token.startsWith('Bearer ')) {
    return null
  }
  token = token.split(' ').pop();
  const record = await Session.findByPk(token);
  if (!record) {
    return null
  }
  return record;
};

module.exports = {
  retrieveToken
};
