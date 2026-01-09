from app.models import db, WorkOrder, Asset, WorkOrderStatus, WorkOrderType, WorkOrderPriority
from sqlalchemy.exc import SQLAlchemyError

def report_fault(data):
    """
    Crea una nueva Orden de Trabajo para un mantenimiento correctivo a partir de un reporte de falla.
    """
    try:
        asset = Asset.query.get(data['asset_id'])
        if not asset:
            return None, {'message': 'Activo no encontrado', 'status': 404}

        # Lógica para determinar la prioridad
        priority = calculate_priority(asset.criticality, data.get('operational_impact'))

        new_work_order = WorkOrder(
            asset_id=data['asset_id'],
            type=WorkOrderType.corrective,
            priority=priority,
            status=WorkOrderStatus.created,
            description=data['description'],
            created_by_user_id=data['user_id'], # Asumiendo que el ID del usuario se envía
            # Aquí se podrían añadir fotos, documentos, etc.
        )
        db.session.add(new_work_order)
        db.session.commit()

        return new_work_order, None
    except SQLAlchemyError as e:
        db.session.rollback()
        return None, {'message': f'Error de base de datos: {str(e)}', 'status': 500}

def calculate_priority(asset_criticality, operational_impact):
    """
    Determina la prioridad de la OT basada en la criticidad del activo y el impacto.
    """
    if asset_criticality in ['high', 'critical'] or operational_impact == 'critical':
        return WorkOrderPriority.urgent
    if asset_criticality == 'medium' or operational_impact == 'high':
        return WorkOrderPriority.high
    if operational_impact == 'medium':
        return WorkOrderPriority.medium
    return WorkOrderPriority.low
