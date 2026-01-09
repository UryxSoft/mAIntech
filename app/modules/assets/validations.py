from app.models import Asset

def validate_asset_data(data, is_update=False, asset_id=None):
    """
    Valida los datos de entrada para la creación o actualización de un activo.
    """
    errors = {}

    required_fields = ['name', 'unique_code', 'category_id', 'location_id', 'criticality']
    for field in required_fields:
        if not data.get(field):
            errors[field] = f"El campo '{field}' es obligatorio."

    unique_code = data.get('unique_code')
    if unique_code:
        query = Asset.query.filter_by(unique_code=unique_code)
        if is_update:
            query = query.filter(Asset.id != asset_id)

        if query.first():
            errors['unique_code'] = f"El código de activo '{unique_code}' ya existe."

    if 'value_initial' in data and data['value_initial']:
        try:
            float(data['value_initial'])
        except (ValueError, TypeError):
            errors['value_initial'] = "El valor inicial debe ser un número."

    if 'criticality' in data and data['criticality']:
        if data['criticality'] not in ['low', 'medium', 'high', 'critical']:
            errors['criticality'] = "El valor de criticidad no es válido."

    return errors
