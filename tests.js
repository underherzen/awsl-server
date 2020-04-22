require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_PRIVATE);
const moment = require('moment');
console.log(process.env.STRIPE_PRIVATE)
stripe.subscriptions.update('sub_H8z9bblSn7Muhj', {
  trial_end: moment().add(1, 'minutes').unix()
}).then(response => {
  console.log(response)
}).catch(e => {
  console.log(e)
})

// stripe.subscriptions.retrieve('sub_H8xyqJ7eS43BmQ')
//   .then(response => console.log(response))
//   .catch(e => console.log(e))
