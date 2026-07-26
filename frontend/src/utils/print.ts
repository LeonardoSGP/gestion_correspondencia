export const imprimirAcuse = (doc: any, tipo: 'RECEPCION' | 'DESPACHO') => {
  const content = `
    <html>
      <head>
        <title>Acuse de ${tipo}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #333; }
          .header { text-align: center; border-bottom: 2px solid #0056b3; padding-bottom: 10px; margin-bottom: 20px; }
          .title { font-size: 24px; font-weight: bold; margin: 0; }
          .subtitle { font-size: 14px; color: #666; margin-top: 5px; }
          .row { margin-bottom: 10px; display: flex; }
          .label { font-weight: bold; width: 150px; }
          .value { flex: 1; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #ccc; padding-top: 10px; }
          .barcode { margin-top: 20px; text-align: center; font-family: 'Courier New', Courier, monospace; font-size: 18px; letter-spacing: 5px;}
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">SGC - ACUSE DE ${tipo}</div>
          <div class="subtitle">Sistema de Gestión de Correspondencia</div>
        </div>
        
        <div class="row">
          <div class="label">Folio:</div>
          <div class="value">${doc.folio}</div>
        </div>
        <div class="row">
          <div class="label">Asunto:</div>
          <div class="value">${doc.asunto || 'N/A'}</div>
        </div>
        <div class="row">
          <div class="label">Fecha de Registro:</div>
          <div class="value">${new Date(doc.createdAt).toLocaleString()}</div>
        </div>
        <div class="row">
          <div class="label">Remitente:</div>
          <div class="value">${doc.remitente || 'N/A'}</div>
        </div>
        <div class="row">
          <div class="label">Destinatario:</div>
          <div class="value">${doc.destinatario || 'N/A'}</div>
        </div>
        
        <div class="barcode">
          *${doc.folio}*
        </div>

        <div class="footer">
          Documento generado automáticamente por SGC. Conservar como comprobante.
        </div>
        
        <script>
          window.onload = function() { window.print(); window.close(); }
        </script>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank', 'width=600,height=600');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(content);
    printWindow.document.close();
  }
};
