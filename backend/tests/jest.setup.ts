// Jest setup — variables de entorno para tests
process.env.JWT_SECRET = 'test-jwt-secret-correspondencia-12345';
process.env.JWT_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-correspondencia-12345';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.DATABASE_URL = 'mysql://root:test@127.0.0.1:3306/correspondencia_test';
