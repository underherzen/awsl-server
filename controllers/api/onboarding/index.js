const { Guide, User, UserGuide, UserGuideList } = require('../../../models');

const passOnboarding = async (req, res, next) => {
  /*   const {
    user: { id },
    body: {  onboardingData, selectedGuides },
  } = req; */

  //const parsedShortNames = shortNames.map((row) => row.dataValues.short_name);
  /*   try {
    await User.update(onboardingData, { where: { id } });
  } catch (error) {
    return res.status(500);
  } */

  /*const guides = await Guide.findAll({
    attributes: ['id', 'short_name'],
    where: {
      is_active: true,
    },
    order: [['position', 'ASC']],
  }).map((row) => row.dataValues);

  const shortNames = guides.map((guide) => guide.short_name);
  const list = new Set([...selectedGuides, ...shortNames]);

  const userGuideList = await UserGuideList.create({ user_id: id });

  const userGuides = await UserGuide.bulkCreate([]);
 */
  return res.status(200).send({});
};

module.exports = {
  passOnboarding,
};
