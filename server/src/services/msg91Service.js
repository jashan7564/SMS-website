export const sendViaMSG91 = async ({ to, body }) => {
  const payload = {
    template_id: process.env.MSG91_TEMPLATE_ID,
    short_url: 0,
    recipients: [
      {
        mobiles: to.replace('+', ''),
        message: body
      }
    ]
  };

  const response = await fetch('https://control.msg91.com/api/v5/flow/', {
    method: 'POST',
    headers: {
      authkey: process.env.MSG91_AUTH_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  return {
    provider: 'msg91',
    providerMessageId: data.request_id || data.type || 'msg91_request',
    status: response.ok ? 'sent' : 'failed',
    raw: data
  };
};