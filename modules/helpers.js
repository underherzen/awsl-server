const {Session, User, UserGuide, UserGuideDay} = require('../models');

const retrieveToken = async headers => {
  let token = headers.authorization;
  if (!token || !token.startsWith('Bearer ')) {
    return null
  }
  token = token.split(' ').pop();
  const record = await Session.findByPk(token);
  if (!record) {
    return null
  }
  return record;
};

const userToFront = async id => {
  let user, userGuides, userGuideDays;
  [user, userGuides, userGuideDays] = await Promise.all([
    User.findByPk(id, {raw: true}),
    UserGuide.findAll(
      {where: {user_id: id}}
    ),
    UserGuideDay.findAll({where: {user_id: id}})
  ]);
  user.all_guides = userGuides;
  user.all_guide_days = userGuideDays;
  return user
};

module.exports = {
  retrieveToken,
  userToFront,

};
