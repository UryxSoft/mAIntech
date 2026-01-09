from app.models import db, PreventiveSchedule, Checklist, Asset
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime, timedelta

def create_preventive_schedule(data):
    """
    Crea un nuevo plan de mantenimiento preventivo.
    'data' contiene toda la información del wizard.
    """
    try:
        # Paso 1: Crear o reutilizar el Checklist (plantilla de tareas)
        checklist = Checklist(
            name=f"Preventivo para {data['asset_name']}",
            tasks=data['tasks'], # Se espera una lista de tareas en formato JSON
            is_template=False, # O podría ser True si se guarda como plantilla reutilizable
            asset_id=data['asset_id']
        )
        db.session.add(checklist)
        db.session.flush() # Para obtener el ID del checklist antes del commit

        # Paso 2: Crear el PreventiveSchedule
        schedule = PreventiveSchedule(
            asset_id=data['asset_id'],
            checklist_id=checklist.id,
            schedule_type=data['schedule_type'], # 'time' o 'usage'
            interval_time=data.get('interval_time'), # 'daily', 'weekly', etc.
            interval_usage=data.get('interval_usage'),
            usage_unit=data.get('usage_unit'), # 'hours', 'km', etc.
            last_executed=None, # Se puede establecer una fecha de inicio si se desea
            next_due=calculate_next_due_date(data.get('interval_time'))
        )
        db.session.add(schedule)
        db.session.commit()

        return schedule, None
    except SQLAlchemyError as e:
        db.session.rollback()
        return None, {'message': f'Error de base de datos: {str(e)}', 'status': 500}
    except Exception as e:
        db.session.rollback()
        return None, {'message': f'Error inesperado: {str(e)}', 'status': 500}

def get_preventive_schedules_for_asset(asset_id):
    """
    Obtiene todos los planes preventivos para un activo específico.
    """
    try:
        schedules = PreventiveSchedule.query.filter_by(asset_id=asset_id).all()
        return schedules, None
    except SQLAlchemyError as e:
        return None, {'message': 'Error al consultar la base de datos', 'status': 500}

def calculate_next_due_date(interval):
    """
    Calcula la próxima fecha de vencimiento basada en el intervalo de tiempo.
    """
    if not interval:
        return None

    today = datetime.utcnow().date()
    if interval == 'daily':
        return today + timedelta(days=1)
    elif interval == 'weekly':
        return today + timedelta(weeks=1)
    elif interval == 'monthly':
        # Simplificación: se puede usar dateutil.relativedelta para más precisión
        return today + timedelta(days=30)
    elif interval == 'annual':
        return today + timedelta(days=365)
    return None
