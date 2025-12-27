from flask import Blueprint, request, jsonify
from extensions import mail  # Asumiendo que inicializaste mail en otro lado
from services.notifications import NotificationService

# Definimos el Blueprint
maintenance_bp = Blueprint('maintenance', __name__, url_prefix='/api/v1/maintenance')

# Instanciamos el servicio
notifier = NotificationService(mail)

def validate_payload(data, required_fields):
    """Función auxiliar para validar que lleguen los datos necesarios"""
    missing = [field for field in required_fields if field not in data]
    return missing

# --- ENDPOINT 1: INICIO DE MANTENIMIENTO ---
@maintenance_bp.route('/start', methods=['POST'])
def start_maintenance():
    data = request.get_json()
    
    # 1. Validación de robustez
    required = ['machine_name', 'type', 'duration_est', 'production_email', 'technician_id']
    missing_fields = validate_payload(data, required)
    
    if missing_fields:
        return jsonify({
            "error": "Datos incompletos", 
            "missing_fields": missing_fields
        }), 400

    # 2. Lógica de Base de Datos (Simulada)
    # new_ot = Maintenance(machine=data['machine_name']...)
    # db.session.add(new_ot)...
    
    # 3. Disparar Notificación
    notifier.notify_start(data)

    return jsonify({"message": "Mantenimiento registrado y notificado", "status": "started"}), 201

# --- ENDPOINT 2: FIN DE MANTENIMIENTO (HANDBACK) ---
@maintenance_bp.route('/finish', methods=['POST'])
def finish_maintenance():
    data = request.get_json()
    
    required = ['machine_name', 'production_email', 'technician_name', 'completion_notes']
    if validate_payload(data, required):
        return jsonify({"error": "Faltan datos obligatorios"}), 400

    # Lógica DB: Cerrar orden de trabajo...
    
    # Notificar
    notifier.notify_finish(data)

    return jsonify({"message": "Máquina liberada exitosamente", "status": "completed"}), 200

# --- ENDPOINT 3: REPORTE DE RETRASO ---
@maintenance_bp.route('/report-delay', methods=['POST'])
def report_delay():
    data = request.get_json()
    
    # Validamos campos específicos para retrasos
    required = ['machine_name', 'reason', 'new_estimated_time', 'production_email']
    if validate_payload(data, required):
        return jsonify({"error": "Faltan datos para reportar retraso"}), 400

    # Lógica de negocio extra:
    # Si la razón es "Falta de repuesto", podríamos disparar otra alerta a Compras automáticamente.
    
    notifier.notify_delay(data)

    return jsonify({"message": "Retraso reportado y alertas enviadas"}), 200

# --- ENDPOINT 4: SOLICITUD DE MATERIALES (URGENTE) ---
@maintenance_bp.route('/request-parts', methods=['POST'])
def request_parts():
    data = request.get_json()
    # Lógica para enviar correo al almacén
    # ...
    return jsonify({"message": "Solicitud enviada a almacén"}), 200