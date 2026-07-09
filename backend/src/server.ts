import app from './app';
import { config } from './config';

const PORT = config.port || 3001;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  console.log(`Documentación Swagger en http://localhost:${PORT}/api-docs`);
});
