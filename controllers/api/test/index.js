const testConnection = async (req, res, next) => {
  try {
    res.sendStatus(200);
  } catch (e) {
    next(e);
  }
};

module.exports = {
  testConnection,
};
