from app.models import db, WorkOrder, WorkOrderType, WorkOrderPriority
from .corrective_service import report_fault

def save_checklist_results(data):
    """
    Guarda los resultados de un checklist de mantenimiento autónomo.
    Si hay anomalías, escala a un mantenimiento correctivo.
    """
    try:
        anomalies = [task for task in data['tasks'] if task['status'] == 'nok']

        if anomalies:
            # Escalar a Mantenimiento Correctivo
            description = "Anomalías detectadas durante checklist autónomo:\n"
            for anomaly in anomalies:
                description += f"- Tarea #{anomaly['id']}: {anomaly['description']}\n"
            if data.get('notes'):
                description += f"\nNotas adicionales: {data['notes']}"

            fault_data = {
                'asset_id': data['asset_id'],
                'description': description,
                'user_id': data['user_id'],
                'operational_impact': 'low' # Impacto por defecto para escalamiento
            }
            report_fault(fault_data)

        # Aquí se guardaría un registro del checklist completado (si el modelo existiera)
        # Por ahora, solo se escala si hay anomalías.

        return {'status': 'success', 'anomalies_found': len(anomalies)}, None

    except Exception as e:
        return None, {'message': f'Error al procesar el checklist: {str(e)}', 'status': 500}
