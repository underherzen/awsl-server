const models = require('../../../../models');

const loadUsers = async (req, res, next) => {
  try {
    const query = `SELECT u.id, u.email, u.first_name, u.phone, 
                  (
                    CASE 
                    WHEN u.guide_id IS NULL THEN 'none'
                    ELSE (SELECT name FROM guides WHERE id = u.guide_id)
                    END
                  ) AS current_guide,
                  (
                    CASE
                    WHEN u.guide_id IS NULL THEN 'none'
                    ELSE (SELECT day FROM user_guides WHERE guide_id = u.guide_id and user_id = u.id)
                    END
                  ) AS guide_day,
                  (
                    SELECT status FROM subscriptions WHERE user_id = u.id
                  ) AS status,
                  (
                    SELECT cancel_at_period_end FROM subscriptions WHERE user_id = u.id
                  ) AS cancel_at_period_end
                  FROM users u;`;

    const [users] = await models.sequelize.query(query);
    res.send({ users });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  loadUsers,
};
