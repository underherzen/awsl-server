const axios = require('axios');
const { ONTRAPORT_HEADERS } = require('../../constants');

const getOntraportStringData = (fields, id = '') => {
  const data = Object.entries(fields);
  const initialValue = id ? `id=${id}` : '';

  return data.reduce((previous, current) => {
    const [key, value] = current;
    return `${previous}&${key}=${value}`;
  }, initialValue);
};

const createOntraportSubscription = (user) => {
  const data = getOntraportStringData(user);
  return axios.post(process.env.ONTRAPORT_API_URL_CONTACTS, data, {
    headers: ONTRAPORT_HEADERS,
  });
};

const updateOntraportSubscription = (id, fields) => {
  const data = getOntraportStringData(fields, id);
  return axios.put(process.env.ONTRAPORT_API_URL_CONTACTS, data, {
    headers: ONTRAPORT_HEADERS,
  });
};

const subscribeOntraport = (fields) => {
  const data = getOntraportStringData(fields);
  const headers = { ...ONTRAPORT_HEADERS, 'Content-Type': 'multipart/form-data' };
  return axios.post(process.env.ONTRAPORT_API_URL_FORM, data, {
    headers: headers,
  });
};

module.exports = {
  createOntraportSubscription,
  updateOntraportSubscription,
  subscribeOntraport,
};
