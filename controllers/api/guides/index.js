


const selectGuide = async (req, res, next) => {
  const body = req.body;
  console.log(body);
  console.log(req.user);
  res.sendStatus(400);
};

module.exports = {
  selectGuide
};
