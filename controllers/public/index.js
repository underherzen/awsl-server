const {Guide} = require('../../models');

const loadGuides = async (req, res, next) => {
  const guides = await Guide.findAll();
  res.send(guides)
};

module.exports = {
  loadGuides
};
