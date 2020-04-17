const personalizeTextMessage = (user, textMessage) => {
  return Object.keys(user).reduce((string, propertyName) => {
    // This normalizes the property names and makes the regex a lot more relaxed.
    // For example, with this, all of the following work: @[firstname], @[first Name], @[FiRsT   nAmE], etc
    const textPropertyName = propertyName.replace(/([a-z])([A-Z])/g, '$1\\s*$2');
    return string.replace(new RegExp(`@\\[${textPropertyName}]`, 'ig'), user[propertyName]);
  }, textMessage)
}

module.exports = {
  personalizeTextMessage
};
