const fs = require('fs');
const files = [
  'archivo/archivo.router.ts',
  'areas/areas.router.ts',
  'despacho/despacho.router.ts',
  'mensajeria/mensajeria.router.ts',
  'recepcion/recepcion.router.ts'
];
files.forEach(f => {
  const path = `c:/Users/leosg/gestion_correspondencia/backend/src/modules/${f}`;
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(/parseInt\(req\.params\.id\)/g, 'parseInt(req.params.id as string)');
  fs.writeFileSync(path, content);
});
console.log('done');
