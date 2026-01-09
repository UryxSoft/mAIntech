
def validate_fault_report(data):
    """
    Valida los datos para un reporte de falla.
    """
    errors = {}
    required_fields = ['asset_id', 'description', 'user_id']
    for field in required_fields:
        if not data.get(field):
            errors[field] = f"El campo '{field}' es obligatorio."
    return errors

def validate_preventive_data(data):
    """
    Valida los datos de entrada para la creación de un plan de mantenimiento preventivo.
    """
    errors = {}

    # --- Validación de Campos Requeridos ---
    required_fields = ['asset_id', 'schedule_type', 'tasks']
    for field in required_fields:
        if not data.get(field):
            errors[field] = f"El campo '{field}' es obligatorio."

    # --- Validación de Lógica Condicional ---
    schedule_type = data.get('schedule_type')
    if schedule_type == 'time':
        if not data.get('interval_time'):
            errors['interval_time'] = "Para programación por tiempo, el intervalo es obligatorio."
    elif schedule_type == 'usage':
        if not data.get('interval_usage') or not data.get('usage_unit'):
            errors['interval_usage'] = "Para programación por uso, el intervalo y la unidad son obligatorios."
    elif schedule_type:
        errors['schedule_type'] = f"El tipo de programación '{schedule_type}' no es válido."

    # --- Validación del Contenido de las Tareas ---
    tasks = data.get('tasks')
    if not isinstance(tasks, list) or not all(isinstance(t, dict) and t.get('description') for t in tasks):
        errors['tasks'] = "Las tareas deben ser una lista de objetos con una 'description'."

    # --- Poka-Yoke: Alertar si ya existe un plan similar (lógica simplificada) ---
    # En una implementación real, esta consulta sería más compleja.
    # from app.models import PreventiveSchedule
    # existing_schedule = PreventiveSchedule.query.filter_by(
    #     asset_id=data.get('asset_id'),
    #     schedule_type=schedule_type,
    #     interval_time=data.get('interval_time'),
    #     usage_unit=data.get('usage_unit')
    # ).first()
    # if existing_schedule:
    #     errors['general'] = "Ya existe un plan preventivo similar para este activo."

    return errors
