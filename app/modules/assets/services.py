from app.models import db, Asset, WorkOrder
from sqlalchemy.exc import SQLAlchemyError

def get_assets(filters):
    """
    Obtiene una lista de activos, aplicando filtros.
    """
    try:
        query = Asset.query

        if 'category_id' in filters and filters['category_id']:
            query = query.filter_by(category_id=filters['category_id'])
        if 'location_id' in filters and filters['location_id']:
            query = query.filter_by(location_id=filters['location_id'])
        if 'criticality' in filters and filters['criticality']:
            query = query.filter_by(criticality=filters['criticality'])

        if 'search' in filters and filters['search']:
            search_term = f"%{filters['search']}%"
            query = query.filter(Asset.name.ilike(search_term) | Asset.unique_code.ilike(search_term))

        assets = query.all()
        return assets, None
    except SQLAlchemyError as e:
        return None, {'message': 'Error al consultar la base de datos', 'status': 500}

def get_asset_by_id(asset_id):
    try:
        asset = Asset.query.get(asset_id)
        return asset, None
    except SQLAlchemyError as e:
        return None, {'message': 'Error al consultar la base de datos', 'status': 500}

def create_asset(data):
    try:
        new_asset = Asset(**data)
        db.session.add(new_asset)
        db.session.commit()
        return new_asset, None
    except SQLAlchemyError as e:
        db.session.rollback()
        return None, {'message': 'Error al crear el activo', 'status': 500}

def update_asset(asset_id, data):
    try:
        asset = Asset.query.get(asset_id)
        if not asset:
            return None, {'message': 'Activo no encontrado', 'status': 404}

        for key, value in data.items():
            setattr(asset, key, value)

        db.session.commit()
        return asset, None
    except SQLAlchemyError as e:
        db.session.rollback()
        return None, {'message': 'Error al actualizar el activo', 'status': 500}

def delete_asset(asset_id):
    try:
        asset = Asset.query.get(asset_id)
        if not asset:
            return False, {'message': 'Activo no encontrado', 'status': 404}

        has_open_work_orders = WorkOrder.query.filter(
            WorkOrder.asset_id == asset_id,
            WorkOrder.status.notin_(['closed', 'canceled'])
        ).first()

        if has_open_work_orders:
            return False, {'message': 'No se puede eliminar un activo con órdenes de trabajo abiertas', 'status': 400}

        db.session.delete(asset)
        db.session.commit()
        return True, None
    except SQLAlchemyError as e:
        db.session.rollback()
        return False, {'message': 'Error al eliminar el activo', 'status': 500}
