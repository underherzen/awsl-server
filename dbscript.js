const fullGuides = require('./fullGuides.json');
const {Guide, GuideDay} = require('./models');

let tmp = [];
for (let guide of Object.keys(fullGuides)) {
  // console.log(fullGuides[guide])
  const processedGuide = fullGuides[guide];
  const query = Guide.create({
    old_guide_id: processedGuide.id,
    name: processedGuide.name,
    coach: processedGuide.coach.trim(),
    credentials: processedGuide.credentials,
    overview: processedGuide.overview,
    img_url: processedGuide.imageUrl,
    url_safe_name: processedGuide.urlSafeName,
    video_url: processedGuide.videoUrl
  });
  tmp.push(query)
}
Promise.all(tmp)
  .then((response) => {
    tmp = [];
    response.forEach(element => {
      const oldGuideId = element.dataValues.old_guide_id;
      const guideId = element.dataValues.id;
      console.log('-----');
      console.log(oldGuideId);
      console.log(guideId);
      const processedGuide = fullGuides[oldGuideId];
      const days = processedGuide.days;
      days.forEach(day => {
        const query = GuideDay.create({
          guide_id: guideId,
          day: day.day,
          title: day.title.trim(),
          text_message: day.textMessage.trim(),
          challenge_name: day.challengeName.trim(),
          description: day.description.trim(),
          challenge: day.challenge,
          video_url: day.videoUrl
        });
        tmp.push(query)
      })
    });
    Promise.all(tmp).then(() => console.log('DONE')).catch(e => console.log(e))

  });

