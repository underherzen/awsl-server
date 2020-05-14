const asyncHandler = require('express-async-handler');
const { Guide } = require('../../../../models');

const loadGuides = asyncHandler(async (req, res, next) => {
  const guides = await Guide.findAll();
  res.send({ guides });
});

const updateGuide = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { guide } = req.body;

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
});

module.exports = {
  loadGuides,
  updateGuide,
};
