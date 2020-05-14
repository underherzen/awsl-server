const asyncHandler = require('express-async-handler');

const testConnection = asyncHandler(async (req, res, next) => {
  res.sendStatus(200);
});

module.exports = {
  testConnection,
};
