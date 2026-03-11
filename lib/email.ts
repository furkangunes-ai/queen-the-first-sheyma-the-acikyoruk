import { Resend } from "resend";
import { logger } from "@/lib/logger";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.EMAIL_FROM || "Şeyda <noreply@seyda.app>";
const APP_URL = process.env.NEXTAUTH_URL || "https://seyda.app";

/**
 * Genel e-posta gönderme fonksiyonu.
 * Fire-and-forget pattern — hata durumunda sessizce loglar.
 */
async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  if (!resend) {
    logger.warn({ to, subject }, "Resend yapılandırılmamış — e-posta gönderilmedi");
    return false;
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) {
      logger.error({ error, to, subject }, "Resend e-posta gönderim hatası");
      return false;
    }

    logger.info({ to, subject }, "E-posta gönderildi");
    return true;
  } catch (error) {
    logger.error({ error, to, subject }, "E-posta gönderim exception");
    return false;
  }
}

/**
 * Hoşgeldin e-postası — kayıt sonrası gönderilir.
 */
export async function sendWelcomeEmail(
  email: string,
  displayName: string
): Promise<void> {
  await sendEmail({
    to: email,
    subject: "Şeyda'ya Hoş Geldiniz! 🎓",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; background: #0f0f23; color: #fff; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); padding: 32px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #fff;">
            Hoş Geldiniz, ${displayName}! ✨
          </h1>
        </div>
        <div style="padding: 32px;">
          <p style="color: #a1a1aa; font-size: 14px; line-height: 1.7; margin: 0 0 16px;">
            Şeyda'ya kayıt olduğunuz için teşekkürler. YKS hazırlık sürecinizde yanınızdayız.
          </p>
          <p style="color: #a1a1aa; font-size: 14px; line-height: 1.7; margin: 0 0 24px;">
            Hemen başlamak için giriş yapabilirsiniz:
          </p>
          <a href="${APP_URL}/login" style="display: inline-block; background: linear-gradient(135deg, #ec4899, #db2777); color: #fff; text-decoration: none; padding: 12px 32px; border-radius: 12px; font-weight: 700; font-size: 14px;">
            Giriş Yap →
          </a>
          <p style="color: #52525b; font-size: 12px; margin-top: 32px; border-top: 1px solid #27272a; padding-top: 16px;">
            Bu e-postayı siz talep etmediyseniz, güvenle görmezden gelebilirsiniz.
          </p>
        </div>
      </div>
    `,
  });
}

/**
 * E-posta doğrulama — kayıt sonrası gönderilir.
 * Doğrulandıktan sonra hoşgeldin maili gönderilir.
 */
export async function sendEmailVerificationEmail(
  email: string,
  token: string,
  displayName: string
): Promise<void> {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;

  await sendEmail({
    to: email,
    subject: "E-posta Doğrulaması — Şeyda",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; background: #0f0f23; color: #fff; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%); padding: 32px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #fff;">
            E-postanızı Doğrulayın ✉️
          </h1>
        </div>
        <div style="padding: 32px;">
          <p style="color: #a1a1aa; font-size: 14px; line-height: 1.7; margin: 0 0 16px;">
            Merhaba ${displayName}, Şeyda'ya kayıt olduğunuz için teşekkürler!
          </p>
          <p style="color: #a1a1aa; font-size: 14px; line-height: 1.7; margin: 0 0 24px;">
            Hesabınızı aktifleştirmek için aşağıdaki butona tıklayın. Bu bağlantı <strong style="color: #22d3ee;">24 saat</strong> geçerlidir.
          </p>
          <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #06b6d4, #0891b2); color: #fff; text-decoration: none; padding: 12px 32px; border-radius: 12px; font-weight: 700; font-size: 14px;">
            E-postamı Doğrula →
          </a>
          <p style="color: #52525b; font-size: 12px; margin-top: 32px; border-top: 1px solid #27272a; padding-top: 16px;">
            Bu e-postayı siz talep etmediyseniz, güvenle görmezden gelebilirsiniz.
          </p>
        </div>
      </div>
    `,
  });
}

/**
 * Şifre sıfırlama e-postası — token linkiyle birlikte gönderilir.
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string,
  displayName: string
): Promise<void> {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  await sendEmail({
    to: email,
    subject: "Şifre Sıfırlama Talebi — Şeyda",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; background: #0f0f23; color: #fff; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #ec4899 0%, #06b6d4 100%); padding: 32px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #fff;">
            Şifre Sıfırlama 🔐
          </h1>
        </div>
        <div style="padding: 32px;">
          <p style="color: #a1a1aa; font-size: 14px; line-height: 1.7; margin: 0 0 16px;">
            Merhaba ${displayName}, hesabınız için şifre sıfırlama talebinde bulunuldu.
          </p>
          <p style="color: #a1a1aa; font-size: 14px; line-height: 1.7; margin: 0 0 24px;">
            Aşağıdaki butona tıklayarak yeni şifrenizi belirleyebilirsiniz. Bu bağlantı <strong style="color: #f472b6;">1 saat</strong> geçerlidir.
          </p>
          <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #ec4899, #db2777); color: #fff; text-decoration: none; padding: 12px 32px; border-radius: 12px; font-weight: 700; font-size: 14px;">
            Şifremi Sıfırla →
          </a>
          <p style="color: #52525b; font-size: 12px; margin-top: 32px; border-top: 1px solid #27272a; padding-top: 16px;">
            Bu talebi siz yapmadıysanız, bu e-postayı güvenle görmezden gelebilirsiniz. Şifreniz değişmeyecektir.
          </p>
        </div>
      </div>
    `,
  });
}
