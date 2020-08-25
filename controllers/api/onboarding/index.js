const { Guide, User, UserGuide, UserGuideList } = require('../../../models');

const passOnboarding = async (req, res, next) => {
  try {
    const {
      user: { id },
      body: { onboardingData, selectedShortNames },
    } = req;

    await User.update(onboardingData, { where: { id } });

    const actualGuides = await Guide.findAll({
      attributes: ['short_name', 'id'],
      where: {
        is_active: true,
      },
      order: [['position', 'ASC']],
    }).map((guide) => Object.values(guide.dataValues));

    const guidesMapping = new Map(actualGuides);
    const shortNames = guidesMapping.keys();

    const formedShortNames = new Set([...selectedShortNames, ...shortNames]);
    const convertedShortNames = Array.from(formedShortNames);

    const userGuidesList = await UserGuideList.create({ user_id: id });

    const formedUserGuides = convertedShortNames.map((short_name, index) => {
      return {
        guides_list_id: userGuidesList.dataValues.id,
        guide_id: guidesMapping.get(short_name),
        position: ++index,
        user_id: id,
      };
    });

    await UserGuide.bulkCreate(formedUserGuides);

    return res.status(200);
  } catch (e) {
    next(e);
  }
};

module.exports = {
  passOnboarding,
};
