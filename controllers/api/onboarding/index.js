const { Guide, User, UserGuide, UserGuideList } = require('../../../models');

const passOnboarding = async (req, res, next) => {
  const {
    user: { id },
    body: { onboardingData, selectedGuides },
  } = req;

  /*   try {
    await User.update(onboardingData, { where: { id } });
  } catch (error) {
    return res.status(500);
  }  */

  /*   const guides = await Guide.findAll({
    attributes: ['short_name', 'id'],
    where: {
      is_active: true,
    },
    order: [['position', 'ASC']],
  }).map((guide) => Object.values(guide.dataValues));

  const guidesMapping = new Map(guides);
  const shortNames = guidesMapping.keys();

  const formedShortNames = new Set([...selectedGuides, ...shortNames]);
  const userGuidesShortNames = Array.from(formedShortNames);

  const userGuidesList = await UserGuideList.create({ user_id: id });

  const formedUserGuides = uniqueShortNames.map((short_name, index) => {
    return {
      guides_list_id: userGuidesList.dataValues.id,
      guide_id: guidesMapping.get(short_name),
      position: ++index,
      user_id: id,
    };
  });

  const result = await UserGuide.bulkCreate(formedUserGuides);

  return res.status(200).send(result); */
};

module.exports = {
  passOnboarding,
};
