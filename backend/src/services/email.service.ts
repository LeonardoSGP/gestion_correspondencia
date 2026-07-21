import nodemailer from 'nodemailer';
import { config } from '../config';

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465,
  auth: config.smtp.user ? {
    user: config.smtp.user,
    pass: config.smtp.pass,
  } : undefined,
});

export async function enviarCorreo(to: string, subject: string, html: string): Promise<void> {
  try {
    await transporter.sendMail({
      from: config.smtp.from,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Error al enviar correo:', error);
    // No lanzar error para no bloquear el flujo principal
    // En produccion se usaria un sistema de colas
  }
}
