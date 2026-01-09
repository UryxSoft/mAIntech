from flask import Blueprint, render_template, request, jsonify
from .preventive_service import create_preventive_schedule, get_preventive_schedules_for_asset
from .corrective_service import report_fault
from .autonomous_service import save_checklist_results
from .validations import validate_preventive_data, validate_fault_report

maintenance_bp = Blueprint(
    'maintenance',
    __name__,
    url_prefix='/maintenance'
)

# --- Rutas de la Interfaz (HTML) ---

@maintenance_bp.route('/')
def index():
    return render_template('maintenance/list.html')

@maintenance_bp.route('/calendar')
def calendar_view():
    return render_template('maintenance/calendar.html')

@maintenance_bp.route('/preventive/new')
def preventive_wizard():
    """
    Renderiza el wizard para crear un nuevo plan preventivo.
    """
    return render_template('maintenance/preventive/wizard.html')

@maintenance_bp.route('/autonomous/checklist/<int:asset_id>')
def autonomous_checklist(asset_id):
    """
    Renderiza un checklist de mantenimiento autónomo para un activo.
    """
    # Aquí se pasaría el checklist específico del activo
    return render_template('maintenance/autonomous/checklist.html')

# --- Rutas de la API (JSON) ---

@maintenance_bp.route('/api/preventive', methods=['POST'])
def api_create_preventive():
    data = request.get_json()
    errors = validate_preventive_data(data)
    if errors:
        return jsonify({'errors': errors}), 400

    schedule, error = create_preventive_schedule(data)
    if error:
        return jsonify({'error': error['message']}), error['status']

    # Asumiendo que el modelo tiene un método to_dict()
    return jsonify(schedule.to_dict()), 201

@maintenance_bp.route('/api/assets/<int:asset_id>/preventive', methods=['GET'])
def api_get_preventive_for_asset(asset_id):
    schedules, error = get_preventive_schedules_for_asset(asset_id)
    if error:
        return jsonify({'error': error['message']}), error['status']

    return jsonify([s.to_dict() for s in schedules]), 200

@maintenance_bp.route('/api/fault', methods=['POST'])
def api_report_fault():
    data = request.get_json()
    errors = validate_fault_report(data)
    if errors:
        return jsonify({'errors': errors}), 400

    work_order, error = report_fault(data)
    if error:
        return jsonify({'error': error['message']}), error['status']

    return jsonify(work_order.to_dict()), 201

@maintenance_bp.route('/api/calendar', methods=['GET'])
def api_get_calendar_events():
    from app.models import PreventiveSchedule, WorkOrder, WorkOrderType

    events = []

    # Obtener mantenimientos preventivos programados
    schedules = PreventiveSchedule.query.filter(PreventiveSchedule.next_due != None).all()
    for s in schedules:
        events.append({
            'id': f'preventive_{s.id}',
            'calendarId': 'preventive',
            'title': f"Preventivo: {s.asset.name}",
            'category': 'time',
            'start': s.next_due.isoformat(),
            'end': s.next_due.isoformat(),
            'backgroundColor': '#3498db', # Azul
        })

    # Obtener mantenimientos correctivos abiertos
    corrective_wos = WorkOrder.query.filter(
        WorkOrder.type == WorkOrderType.corrective,
        WorkOrder.status.notin_(['closed', 'canceled'])
    ).all()
    for wo in corrective_wos:
        events.append({
            'id': f'corrective_{wo.id}',
            'calendarId': 'corrective',
            'title': f"Correctivo: {wo.asset.name}",
            'category': 'time',
            'start': wo.start_date.isoformat() if wo.start_date else wo.created_date.isoformat(),
            'end': wo.start_date.isoformat() if wo.start_date else wo.created_date.isoformat(),
            'backgroundColor': '#e74c3c', # Rojo
        })

    return jsonify(events)

@maintenance_bp.route('/api/autonomous/checklist', methods=['POST'])
def api_save_checklist():
    data = request.get_json()
    # Aquí iría la validación de los datos del checklist

    result, error = save_checklist_results(data)
    if error:
        return jsonify({'error': error['message']}), error['status']

    return jsonify(result), 200
