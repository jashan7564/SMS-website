import { sendViaTwilio } from './twilioService.js';
import { sendViaMSG91 } from './msg91Service.js';

export const pickProvider = (country, phone) => {
  if (country.toLowerCase() === 'india' || phone.startsWith('+91')) {
    return 'msg91';
  }
  return 'twilio';
};

export const sendSmsByProvider = async ({ country, to, body }) => {
  const provider = pickProvider(country, to);
  if (provider === 'msg91') {
    return sendViaMSG91({ to, body });
  }
  return sendViaTwilio({ to, body });
};