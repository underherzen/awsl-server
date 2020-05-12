const { Guide } = require('../../../../models');

const loadGuides = async (req, res, next) => {
  try {
    const guides = await Guide.findAll();
    res.send({ guides });
  } catch (e) {
    next(e);
  }
};

const updateGuide = async (req, res, next) => {
  const { id } = req.params;
  const { guide } = req.body;
  console.log(guide);
  try {
    await Guide.update(
      {
        ...guide,
        position: +guide.position,
      },
      {
        where: {
          id,
        },
      }
    );

    return res.sendStatus(200);
  } catch (e) {
    next(e);
  }
};

module.exports = {
  loadGuides,
  updateGuide,
};
