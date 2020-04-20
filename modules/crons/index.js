const personalizeTextMessage = (user, textMessage) => {
  return Object.keys(user).reduce((string, propertyName) => {
    // This normalizes the property names and makes the regex a lot more relaxed.
    // For example, with this, all of the following work: @[firstname], @[first Name], @[FiRsT   nAmE], etc
    const textPropertyName = propertyName.replace(/([a-z])([A-Z])/g, '$1\\s*$2');
    return string.replace(new RegExp(`@\\[${textPropertyName}]`, 'ig'), user[propertyName]);
  }, textMessage)
};

const getTimezones = sendTime => {
  const date = new Date();

  const offsetHours = date.getUTCHours() - sendTime;
  const tz = offsetHours < 0 ? offsetHours + 24 : offsetHours - 24;

  const offsetMinutes = date.getUTCMinutes();
  const timezones = [offsetHours, tz]
    .filter(el => Math.abs(el) <= 12)
    .map(el => el < 0 ? 60 * el + offsetMinutes : 60 * el - offsetMinutes);
  return timezones
};

const sendInternationalSms = async (client, messageObject) => {
  let res;
  try {
    res = await client.messages.create(messageObject);
  } catch (e) {
    // 21612 Twilio error - is'nt reachable for short code
    if (e.code === 21612) {
      messageObject.from = process.env.INTERNATIONAL_PHONE;
      res = await client.messages.create(messageObject);
    } else {
      throw e
    }
  }
  return res;
};

const getTwilioNumber = async (client, from) => {
  const phoneData = await client.lookups.phoneNumbers(from).fetch();
  const isUSPhone = phoneData.countryCode === "US";
  return isUSPhone ? process.env.PHONE : process.env.INTERNATIONAL_PHONE
};

module.exports = {
  personalizeTextMessage,
  getTimezones,
  sendInternationalSms,
  getTwilioNumber
};
