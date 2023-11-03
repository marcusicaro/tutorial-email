const { Resend } = require('resend');
require('dotenv').config();
const ResendKey = process.env.RESEND_KEY;
const instanceResend = new Resend(ResendKey);

// Envia um email para o destinatário informado
async function sendEmail(destinatary, verificationCode) {
  try {
    const data = await instanceResend.emails.send({
      from: 'SeuNomeAqui <onboarding@resend.dev>',
      to: destinatary,
      subject: 'Verifique sua conta',
      html: `<strong>${verificationCode}</strong>`,
    });
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Exporta a função sendEmail
module.exports = { sendEmail };
