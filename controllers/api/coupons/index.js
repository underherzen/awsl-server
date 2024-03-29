const stripe = require('stripe')(process.env.STRIPE_PRIVATE);

const retrieveCoupon = async (req, res, next) => {
  try {
    const body = req.query;
    if (!body.coupon) {
      res.status(400).send({ error: 'Coupon must not be empty' });
      return;
    }

    let coupon = body.coupon.trim().toUpperCase();
    try {
      coupon = await stripe.coupons.retrieve(coupon);
    } catch (e) {
      res.status(400).send({ error: 'Provided coupon doesn`t exist' });
      return;
    }

    if (!coupon) {
      res.status(400).send({ error: 'Provided coupon doesn`t exist' });
      return;
    }

    res.send({
      message: 'Coupon is applied now',
      coupon_percentage: coupon.percent_off,
      duration: coupon.duration,
    });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  retrieveCoupon,
};
