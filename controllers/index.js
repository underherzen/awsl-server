const isUserActive = (req, res, next) => {
  if (!req.user.is_active) {
    res.sendStatus(401);
    return;
  }
  next();
};

module.exports= {
  isUserActive
};
