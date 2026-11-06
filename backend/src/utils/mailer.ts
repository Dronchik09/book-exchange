import nodemailer from 'nodemailer';
import { Resend } from 'resend';

interface ExchangeEmailPayload {
  ownerEmail: string;
  ownerName: string;
  targetBook: {
    name: string;
    author: string;
  };
  sender: {
    name: string;
    email: string;
  };
  senderBooks: Array<{
    name: string;
    author: string;
  }>;
}

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendExchangeRequestEmail = async (payload: ExchangeEmailPayload) => {
  const booksListHtml =
    payload.senderBooks.length > 0
      ? `<ul>${payload.senderBooks
          .map((b) => `<li><strong>${b.name}</strong> — ${b.author}</li>`)
          .join('')}</ul>`
      : '<p><em>У користувача наразі немає доданих книг у списку.</em></p>';

  const booksListText =
    payload.senderBooks.length > 0
      ? payload.senderBooks.map((b, i) => `${i + 1}. "${b.name}" — ${b.author}`).join('\n')
      : 'У користувача наразі немає доданих книг у списку.';

  const subject = `Запит на обмін книги "${payload.targetBook.name}"`;
  const text = `Привіт, ${payload.ownerName}!\n\nКористувач ${payload.sender.name} (${payload.sender.email}) хоче обміняти вашу книгу "${payload.targetBook.name}" (${payload.targetBook.author}).\n\nКниги відправника для обміну:\n${booksListText}`;
  const html = `
    <div style="font-family: sans-serif; line-height: 1.6; color: #1f2937;">
      <h2>Новий запит на обмін книги!</h2>
      <p>Привіт, <strong>${payload.ownerName}</strong>!</p>
      <p>
        Користувач <strong>${payload.sender.name}</strong> (<a href="mailto:${payload.sender.email}">${payload.sender.email}</a>)
        пропонує обмін на вашу книгу <strong>«${payload.targetBook.name}»</strong> (${payload.targetBook.author}).
      </p>
      <h3>Книги відправника для обміну:</h3>
      ${booksListHtml}
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
      <p style="font-size: 12px; color: #6b7280;">Зв'яжіться з відправником за адресою ${payload.sender.email} для узгодження обміну.</p>
    </div>
  `;

  // 1. Пріоритет: Resend (якщо вказано RESEND_API_KEY)
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      const from = process.env.RESEND_FROM || 'BookExchange <onboarding@resend.dev>';
      const data = await resend.emails.send({
        from,
        to: payload.ownerEmail,
        subject,
        text,
        html,
      });

      console.log(`🚀 Лист надіслано через Resend до ${payload.ownerEmail}! ID:`, data.data?.id);
      return {
        messageId: data.data?.id || 'resend-sent',
        previewUrl: null,
      };
    } catch (err) {
      console.error('Помилка відправки через Resend:', err);
      throw err;
    }
  }

  // 2. Фолбек: SMTP (Nodemailer / Ethereal)
  const transporter = createTransporter();
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || '"BookExchange" <noreply@bookexchange.local>',
    to: payload.ownerEmail,
    subject,
    text,
    html,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info) || null;
  if (previewUrl) {
    console.log(`📧 Лист надіслано через SMTP! Перегляд: ${previewUrl}`);
  }

  return {
    messageId: info.messageId,
    previewUrl,
  };
};
