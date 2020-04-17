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

module.exports = {
  personalizeTextMessage,
  getTimezones
};
