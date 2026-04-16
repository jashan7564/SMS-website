import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export const sendViaTwilio = async ({ to, body }) => {
  const message = await client.messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER,
    to,
    statusCallback: process.env.TWILIO_STATUS_CALLBACK_URL
  });

  return {
    provider: 'twilio',
    providerMessageId: message.sid,
    status: message.status || 'queued'
  };
};