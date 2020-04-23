const stripe = require('stripe')(process.env.STRIPE_PRIVATE);

const retrieveCoupon = async (coupon) => {
  try {
    coupon = coupon.trim().toUpperCase();
    coupon = await stripe.coupons.retrieve(coupon);
    return coupon;
  } catch (e) {
    return null;
  }
};

module.exports = {
  retrieveCoupon,
};
