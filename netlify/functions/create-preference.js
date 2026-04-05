// ============================================================
//  Importado Devoto — Mercado Pago Checkout Pro
//  Ubicación: netlify/functions/create-preference.js
// ============================================================

const ACCESS_TOKEN = 'APP_USR-4957780749221652-040314-3ff008a79049b6e9ca78877e0d050c99-3311074099';

exports.handler = async function(event) {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { items, orderId, payer } = JSON.parse(event.body);

    // Detect actual domain dynamically — works on any Netlify subdomain or custom domain
    const host =
      event.headers['x-forwarded-host'] ||
      event.headers['host'] ||
      'lucky-melba-fe122d.netlify.app';
    const REDIRECT_URL = `https://${host}`;

    console.log(`Order ${orderId} | redirect: ${REDIRECT_URL} | items: ${items.length}`);

    const mpItems = items.map(item => ({
      id: item.id,
      title: `${item.name} - Talle ${item.size}`,
      description: item.brand || 'Importado Devoto',
      category_id: 'fashion',
      quantity: Number(item.qty) || 1,
      currency_id: 'ARS',
      unit_price: Number(item.price),
    }));

    const preference = {
      items: mpItems,
      payer: { name: payer.name, email: payer.email },
      back_urls: {
        success: `${REDIRECT_URL}/?status=approved&order=${orderId}`,
        failure: `${REDIRECT_URL}/?status=failure&order=${orderId}`,
        pending: `${REDIRECT_URL}/?status=pending&order=${orderId}`,
      },
      auto_return: 'approved',
      external_reference: orderId,
      statement_descriptor: 'IMPORTADO DEVOTO',
    };

    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preference),
    });

    const data = await mpRes.json();

    if (!mpRes.ok) {
      console.error('MP Error:', JSON.stringify(data));
      return {
        statusCode: mpRes.status,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: data.message || 'Error MP' }),
      };
    }

    console.log('Preference created:', data.id, '| URL:', data.init_point);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        id: data.id,
        init_point: data.init_point,
        sandbox_init_point: data.sandbox_init_point,
      }),
    };

  } catch (error) {
    console.error('Function error:', error.message);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
