import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

type SendPasswordResetEmailProps = {
  email: string;
  name: string;
  resetUrl: string;
};

export async function sendPasswordResetEmail({
  email,
  name,
  resetUrl,
}: SendPasswordResetEmailProps) {
  await transporter.sendMail({
    from: `"LifeHub" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Resetowanie hasła — LifeHub",

    text: `
Cześć ${name},

otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta LifeHub.

Aby ustawić nowe hasło, otwórz poniższy link:

${resetUrl}

Link jest ważny przez 30 minut i może zostać wykorzystany tylko raz.

Jeśli nie prosiłeś o zmianę hasła, możesz zignorować tę wiadomość.

Pozdrawiamy,
LifeHub
`,

    html: `
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Resetowanie hasła</title>
</head>

<body
  style="
    margin: 0;
    padding: 0;
    background-color: #f8fafc;
    font-family: Arial, Helvetica, sans-serif;
    color: #0f172a;
  "
>
  <div style="padding: 40px 20px;">
    <div
      style="
        max-width: 560px;
        margin: 0 auto;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 20px;
        padding: 40px;
      "
    >
      <div style="text-align: center; margin-bottom: 30px;">
        <h1
          style="
            margin: 0;
            font-size: 28px;
            color: #071b33;
          "
        >
          Life<span style="color: #d39b27;">Hub</span>
        </h1>
      </div>

      <h2
        style="
          margin: 0 0 16px;
          font-size: 22px;
          color: #0f172a;
        "
      >
        Resetowanie hasła
      </h2>

      <p
        style="
          margin: 0 0 16px;
          font-size: 15px;
          line-height: 1.7;
          color: #475569;
        "
      >
        Cześć ${name},
      </p>

      <p
        style="
          margin: 0 0 24px;
          font-size: 15px;
          line-height: 1.7;
          color: #475569;
        "
      >
        Otrzymaliśmy prośbę o zresetowanie hasła do Twojego
        konta LifeHub.
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a
          href="${resetUrl}"
          style="
            display: inline-block;
            padding: 14px 24px;
            background-color: #071b33;
            color: #ffffff;
            text-decoration: none;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
          "
        >
          Ustaw nowe hasło
        </a>
      </div>

      <p
        style="
          margin: 0 0 16px;
          font-size: 13px;
          line-height: 1.6;
          color: #64748b;
        "
      >
        Link jest ważny przez <strong>30 minut</strong>
        i może zostać wykorzystany tylko raz.
      </p>

      <p
        style="
          margin: 0;
          font-size: 13px;
          line-height: 1.6;
          color: #64748b;
        "
      >
        Jeśli nie prosiłeś o zmianę hasła, możesz zignorować
        tę wiadomość.
      </p>

      <div
        style="
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
        "
      >
        <p
          style="
            margin: 0;
            font-size: 12px;
            color: #94a3b8;
          "
        >
          LifeHub
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`,
  });
}
