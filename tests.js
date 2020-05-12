require('dotenv').config();
//const stripe = require('stripe')(process.env.STRIPE_PRIVATE);
//const moment = require('moment');
const { Token } = require('./models');
console.log(process.env.STRIPE_PRIVATE);
const { TOKEN_TYPES } = require('./constants');

// let dayToAssign = 21;
//
// let promises = [];
// let count = 2;
// while (count < dayToAssign) {
//   promises.push(
//     UserGuideDay.create({
//       user_id: 11,
//       day: count,
//       guide_id: 3
//     })
//   )
//   count += 1
// }
// promises.push(UserGuide.update({
//   day: dayToAssign
// }, {
//   where: {
//     user_id: 11
//   }
// }))
// Promise.all(promises).catch(e => console.log(e))
// stripe.subscriptions
//   .update('sub_H8zv825hVaoHyK', {
//     trial_end: moment().add(1, 'minutes').unix(),
//   })
//   .then((response) => {
//     console.log(response);
//   })
//   .catch((e) => {
//     console.log(e);
//   });

// stripe.subscriptions.retrieve('sub_H8xyqJ7eS43BmQ')
//   .then(response => console.log(response))
//   .catch(e => console.log(e))
Token.findAll({
  where: {
    type: TOKEN_TYPES.SMS_AUTH,
  },
}).then((response) => {
  console.log(response.length);
  const uniqueTokens = [...new Set(response)];
  console.log(uniqueTokens.length);
});
