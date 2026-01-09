from flask import Blueprint, jsonify, request, render_template
from .services import (
    get_assets, get_asset_by_id, create_asset,
    update_asset, delete_asset
)
from .validations import validate_asset_data

assets_bp = Blueprint(
    'assets',
    __name__
)

# --- Rutas de la Interfaz (HTML) ---
@assets_bp.route('/assets')
def list_page():
    """
    Renderiza la página principal de gestión de activos.
    """
    return render_template('assets/list.html')


# --- Rutas de la API (JSON) ---
@assets_bp.route('/api/assets', methods=['GET'])
def api_list_assets():
    filters = request.args.to_dict()
    assets, error = get_assets(filters)
    if error:
        return jsonify({'error': error['message']}), error['status']
    return jsonify([asset.to_dict() for asset in assets]), 200

@assets_bp.route('/api/assets/<int:asset_id>', methods=['GET'])
def api_get_asset(asset_id):
    asset, error = get_asset_by_id(asset_id)
    if error:
        return jsonify({'error': error['message']}), error['status']
    if not asset:
        return jsonify({'error': 'Activo no encontrado'}), 404
    return jsonify(asset.to_dict()), 200

@assets_bp.route('/api/assets', methods=['POST'])
def api_create_asset():
    data = request.get_json()
    errors = validate_asset_data(data)
    if errors:
        return jsonify({'errors': errors}), 400
    asset, error = create_asset(data)
    if error:
        return jsonify({'error': error['message']}), error['status']
    return jsonify(asset.to_dict()), 201

@assets_bp.route('/api/assets/<int:asset_id>', methods=['PUT'])
def api_update_asset(asset_id):
    data = request.get_json()
    errors = validate_asset_data(data, is_update=True, asset_id=asset_id)
    if errors:
        return jsonify({'errors': errors}), 400
    asset, error = update_asset(asset_id, data)
    if error:
        return jsonify({'error': error['message']}), error['status']
    return jsonify(asset.to_dict()), 200

@assets_bp.route('/api/assets/<int:asset_id>', methods=['DELETE'])
def api_delete_asset(asset_id):
    success, error = delete_asset(asset_id)
    if error:
        return jsonify({'error': error['message']}), error['status']
    return jsonify({'message': 'Activo eliminado correctamente'}), 200
