import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(10).default('correspondencia_jwt_secret_key_2026'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(10).default('correspondencia_refresh_secret_key_2026'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  // SMTP para recuperacion de contrasena (HU-02)
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().default(''),
  SMTP_PASS: z.string().default(''),
  SMTP_FROM: z.string().default('noreply@correspondencia.gob.mx'),
  // URL del frontend para enlaces de recuperacion
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  // Inactividad de sesion en minutos (HU-05)
  SESSION_INACTIVITY_MINUTES: z.coerce.number().default(30),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Error de validacion en las variables de entorno:');
  console.error(parsedEnv.error.format());
  process.exit(1);
}

export const config = {
  port: parsedEnv.data.PORT,
  dbUrl: parsedEnv.data.DATABASE_URL,
  jwtSecret: parsedEnv.data.JWT_SECRET,
  jwtExpiresIn: parsedEnv.data.JWT_EXPIRES_IN,
  jwtRefreshSecret: parsedEnv.data.JWT_REFRESH_SECRET,
  jwtRefreshExpiresIn: parsedEnv.data.JWT_REFRESH_EXPIRES_IN,
  smtp: {
    host: parsedEnv.data.SMTP_HOST,
    port: parsedEnv.data.SMTP_PORT,
    user: parsedEnv.data.SMTP_USER,
    pass: parsedEnv.data.SMTP_PASS,
    from: parsedEnv.data.SMTP_FROM,
  },
  frontendUrl: parsedEnv.data.FRONTEND_URL,
  sessionInactivityMinutes: parsedEnv.data.SESSION_INACTIVITY_MINUTES,
};
