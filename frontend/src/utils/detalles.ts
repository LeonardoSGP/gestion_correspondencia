import Swal from 'sweetalert2';
import api from '../services/api';

export const mostrarDetallesCorrespondencia = async (doc: any) => {
  try {
    const histResponse = await api.get(`/archivo/${doc.id}/historial`);
    const historial = histResponse.data;
    
    let timelineHtml = '<div style="text-align: left; font-size: 0.9em; max-height: 300px; overflow-y: auto;">';
    
    if (historial.length === 0) {
      timelineHtml += '<p style="color: #666; text-align: center;">No hay historial registrado.</p>';
    } else {
      historial.forEach((h: any) => {
        const date = new Date(h.createdAt).toLocaleString();
        const estadoLabel = h.estadoNuevo ? ` (${h.estadoNuevo})` : '';
        timelineHtml += `
          <div style="margin-bottom: 10px; border-left: 3px solid #0056b3; padding-left: 10px;">
            <strong>${date}</strong><br>
            <span style="color: #666;">${h.accion}${estadoLabel}</span><br>
            <em>${h.detalle}</em>
          </div>
        `;
      });
    }
    timelineHtml += '</div>';

    Swal.fire({
      title: `Folio: ${doc.folio}`,
      html: `
        <p><strong>Asunto:</strong> ${doc.asunto}</p>
        <p><strong>Estado Actual:</strong> ${doc.estado}</p>
        <p><strong>Remitente/Destinatario:</strong> ${doc.remitente || doc.destinatario || 'N/A'}</p>
        <hr>
        <h4 style="text-align: left; margin-bottom: 10px;">Trazabilidad:</h4>
        ${timelineHtml}
      `,
      width: '600px',
      confirmButtonText: 'Cerrar'
    });
  } catch (error) {
    console.error('Error fetching historial', error);
    Swal.fire('Error', 'No se pudo cargar el historial del documento.', 'error');
  }
};
