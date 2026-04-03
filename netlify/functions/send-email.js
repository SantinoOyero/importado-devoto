const RESEND_API_KEY = 'TU_RESEND_API_KEY_AQUI';
// Conseguís la key en: resend.com/api-keys
// Ejemplo: 're_xxxxxxxxxxxxxxxxxxxxxxxxxx'

const FROM_EMAIL = 'Importado Devoto <onboarding@resend.dev>';
// Cuando tengas el dominio verificado, cambiá a:
// 'Importado Devoto <pedidos@importadodevoto.com.ar>'

exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' }, body: '' };
  }
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const { order, storeEmail || "santinooypi@gmail.com" } = JSON.parse(event.body);

    const payLabels = { mp: 'Mercado Pago', card: 'Tarjeta de crédito/débito', cash: 'Efectivo' };
    const payMethod = payLabels[order.payMethod] || order.payMethod;

    // Build items HTML for email
    const itemsRows = order.items.map(i => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;">
          <strong>${i.name}</strong><br/>
          <span style="color:#777;font-size:13px;">${i.brand} · Talle: ${i.size}</span>
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:700;">
          $${i.price.toLocaleString('es-AR')}
        </td>
      </tr>`).join('');

    const address = `${order.address.calle}${order.address.depto ? ' ' + order.address.depto : ''}, ${order.address.barrio}${order.address.cp ? ' (CP: ' + order.address.cp + ')' : ''}`;

    // ── Email to CUSTOMER
    const customerHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f5f2ed;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:30px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08);">
    
    <!-- Header -->
    <div style="background:#2A6044;padding:28px 32px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:22px;letter-spacing:2px;text-transform:uppercase;">Importado Devoto</h1>
      <p style="color:rgba(255,255,255,.75);margin:4px 0 0;font-size:13px;">Villa Devoto · Buenos Aires</p>
    </div>

    <!-- Success icon -->
    <div style="text-align:center;padding:28px 32px 16px;">
      <div style="width:60px;height:60px;background:rgba(75,174,127,.12);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;">
        <span style="font-size:26px;">✅</span>
      </div>
      <h2 style="margin:0;font-size:20px;color:#141414;">¡Pedido recibido!</h2>
      <p style="color:#777;font-size:14px;margin:6px 0 0;">Gracias, <strong>${order.customer.nombre}</strong>. Te confirmamos tu orden.</p>
    </div>

    <!-- Order number -->
    <div style="margin:0 32px;background:#f8f8f8;border-radius:10px;padding:12px 16px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#aaa;text-transform:uppercase;letter-spacing:1px;">Número de orden</p>
      <p style="margin:4px 0 0;font-size:18px;font-weight:700;color:#2A6044;letter-spacing:2px;">${order.id}</p>
    </div>

    <!-- Items -->
    <div style="padding:20px 32px;">
      <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#aaa;margin:0 0 12px;">Productos</h3>
      <table style="width:100%;border-collapse:collapse;">${itemsRows}</table>
      <div style="display:flex;justify-content:space-between;padding:12px 0;font-size:16px;font-weight:700;">
        <span>Total pagado</span>
        <span style="color:#2A6044;">$${order.total.toLocaleString('es-AR')}</span>
      </div>
    </div>

    <!-- Info grid -->
    <div style="margin:0 32px;background:#f8f8f8;border-radius:10px;padding:16px;margin-bottom:20px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:5px 0;font-size:13px;color:#aaa;width:40%;">Método de pago</td>
          <td style="padding:5px 0;font-size:13px;font-weight:600;">${payMethod}</td>
        </tr>
        <tr>
          <td style="padding:5px 0;font-size:13px;color:#aaa;">Dirección de envío</td>
          <td style="padding:5px 0;font-size:13px;font-weight:600;">${address}</td>
        </tr>
        <tr>
          <td style="padding:5px 0;font-size:13px;color:#aaa;">Teléfono</td>
          <td style="padding:5px 0;font-size:13px;font-weight:600;">${order.customer.tel}</td>
        </tr>
        <tr>
          <td style="padding:5px 0;font-size:13px;color:#aaa;">Fecha</td>
          <td style="padding:5px 0;font-size:13px;font-weight:600;">${order.date}</td>
        </tr>
      </table>
    </div>

    <!-- CTA -->
    <div style="padding:4px 32px 28px;text-align:center;">
      <p style="color:#555;font-size:14px;line-height:1.6;margin-bottom:16px;">
        Nos contactaremos por WhatsApp para coordinar el envío.<br/>
        Cualquier consulta escribinos directamente.
      </p>
      <a href="https://wa.me/541164890594?text=Hola%2C%20quiero%20consultar%20sobre%20mi%20pedido%20${order.id}"
         style="background:#25D366;color:#fff;text-decoration:none;padding:12px 28px;border-radius:100px;font-weight:700;font-size:14px;display:inline-block;">
        💬 Contactar por WhatsApp
      </a>
    </div>

    <!-- Footer -->
    <div style="background:#141414;padding:16px 32px;text-align:center;">
      <p style="color:rgba(255,255,255,.4);font-size:12px;margin:0;">
        © 2024 Importado Devoto · Villa Devoto, Buenos Aires<br/>
        <a href="https://www.instagram.com/importado.devoto/" style="color:rgba(255,255,255,.4);text-decoration:none;">@importado.devoto</a>
      </p>
    </div>
  </div>
</body>
</html>`;

    // ── Email to STORE (admin notification)
    const storeHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f5f2ed;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:30px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08);">
    <div style="background:#141414;padding:20px 28px;">
      <h2 style="color:#fff;margin:0;font-size:16px;">🛍️ Nueva orden — ${order.id}</h2>
      <p style="color:rgba(255,255,255,.5);margin:4px 0 0;font-size:13px;">${order.date}</p>
    </div>
    <div style="padding:20px 28px;">
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
        <tr><td style="padding:5px 0;font-size:13px;color:#aaa;width:35%;">Cliente</td><td style="font-weight:700;font-size:13px;">${order.customer.nombre}</td></tr>
        <tr><td style="padding:5px 0;font-size:13px;color:#aaa;">Email</td><td style="font-size:13px;">${order.customer.email}</td></tr>
        <tr><td style="padding:5px 0;font-size:13px;color:#aaa;">Teléfono</td><td style="font-size:13px;">${order.customer.tel}</td></tr>
        <tr><td style="padding:5px 0;font-size:13px;color:#aaa;">Dirección</td><td style="font-size:13px;">${address}</td></tr>
        <tr><td style="padding:5px 0;font-size:13px;color:#aaa;">Pago</td><td style="font-size:13px;">${payMethod}</td></tr>
      </table>
      <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#aaa;margin:0 0 10px;">Productos</h3>
      <table style="width:100%;border-collapse:collapse;">${itemsRows}</table>
      <div style="padding:12px 0;font-size:16px;font-weight:700;border-top:2px solid #f0f0f0;margin-top:4px;">
        Total: <span style="color:#2A6044;">$${order.total.toLocaleString('es-AR')}</span>
      </div>
      <a href="https://wa.me/${order.customer.tel.replace(/\\D/g,'')}"
         style="background:#25D366;color:#fff;text-decoration:none;padding:10px 22px;border-radius:100px;font-weight:700;font-size:13px;display:inline-block;margin-top:8px;">
        💬 Contactar cliente por WhatsApp
      </a>
    </div>
  </div>
</body>
</html>`;

    // Send both emails via Resend
    const sendEmail = async (to, subject, html) => {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify({ from: FROM_EMAIL, to, subject, html })
      });
      if (!res.ok) {
        const err = await res.text();
        console.error(`Email to ${to} failed:`, err);
      }
      return res;
    };

    await Promise.all([
      sendEmail(order.customer.email, `✅ Pedido recibido — ${order.id} | Importado Devoto`, customerHtml),
      sendEmail(storeEmail || "santinooypi@gmail.com", `🛍️ Nueva orden ${order.id} — ${order.customer.nombre} — $${order.total.toLocaleString('es-AR')}`, storeHtml)
    ]);

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true })
    };

  } catch (error) {
    console.error('send-email error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message })
    };
  }
};
