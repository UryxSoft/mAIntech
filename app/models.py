from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import enum
import json

db = SQLAlchemy()

class Company(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    sites = db.relationship('Site', backref='company', lazy=True)

class Site(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    address = db.Column(db.Text)
    company_id = db.Column(db.Integer, db.ForeignKey('company.id'))
    users = db.relationship('User', backref='site', lazy=True)
    locations = db.relationship('Location', backref='site', lazy=True)
    assets = db.relationship('Asset', backref='site', lazy=True)
    warehouses = db.relationship('Warehouse', backref='site', lazy=True)
    audits = db.relationship('Audit', backref='site', lazy=True)

class Role(enum.Enum):
    admin = 'admin'
    supervisor = 'supervisor'
    technician = 'technician'
    operator = 'operator'
    guest = 'guest'

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True)
    role = db.Column(db.Enum(Role), nullable=False)
    site_id = db.Column(db.Integer, db.ForeignKey('site.id'))
    company_id = db.Column(db.Integer, db.ForeignKey('company.id'))
    skills = db.relationship('UserSkill', backref='user', lazy=True)
    certifications = db.relationship('Certification', backref='user', lazy=True)
    work_orders_created = db.relationship('WorkOrder', foreign_keys='WorkOrder.created_by_user_id', backref='creator', lazy=True)
    work_orders_assigned = db.relationship('WorkOrder', foreign_keys='WorkOrder.assigned_to_user_id', backref='assignee', lazy=True)
    purchase_requests = db.relationship('PurchaseRequest', backref='requester', lazy=True)
    inventory_movements = db.relationship('InventoryMovement', backref='user', lazy=True)
    incidents = db.relationship('Incident', backref='reporter', lazy=True)
    permits = db.relationship('Permit', backref='issuer', lazy=True)
    audits = db.relationship('Audit', backref='auditor', lazy=True)
    notifications = db.relationship('Notification', backref='user', lazy=True)

class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    assets = db.relationship('Asset', backref='category', lazy=True)

class Manufacturer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    models = db.relationship('Model', backref='manufacturer', lazy=True)
    assets = db.relationship('Asset', backref='manufacturer', lazy=True)
    spare_parts = db.relationship('SparePart', backref='manufacturer', lazy=True)

class Model(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    manufacturer_id = db.Column(db.Integer, db.ForeignKey('manufacturer.id'))
    assets = db.relationship('Asset', backref='model', lazy=True)

class Location(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('location.id'))
    site_id = db.Column(db.Integer, db.ForeignKey('site.id'))
    layout = db.Column(db.JSON)
    children = db.relationship('Location', backref=db.backref('parent', remote_side=[id]), lazy=True)
    assets = db.relationship('Asset', backref='location', lazy=True)
    warehouses = db.relationship('Warehouse', backref='location', lazy=True)

class Asset(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    unique_code = db.Column(db.String(255), unique=True, nullable=False)
    name = db.Column(db.String(255), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'))
    model_id = db.Column(db.Integer, db.ForeignKey('model.id'))
    manufacturer_id = db.Column(db.Integer, db.ForeignKey('manufacturer.id'))
    specs = db.Column(db.JSON)
    location_id = db.Column(db.Integer, db.ForeignKey('location.id'))
    site_id = db.Column(db.Integer, db.ForeignKey('site.id'))
    value_initial = db.Column(db.Numeric(15,2))
    value_current = db.Column(db.Numeric(15,2))
    depreciation_method = db.Column(db.Enum('straight_line', 'declining_balance', 'none'))
    purchase_date = db.Column(db.Date)
    hierarchy_parent_id = db.Column(db.Integer, db.ForeignKey('asset.id'))
    criticality = db.Column(db.Enum('low', 'medium', 'high', 'critical'))
    warranty_expiry = db.Column(db.Date)
    children = db.relationship('Asset', backref=db.backref('parent', remote_side=[id]), lazy=True)
    work_orders = db.relationship('WorkOrder', backref='asset', lazy=True)
    checklists = db.relationship('Checklist', backref='asset', lazy=True)
    preventive_schedules = db.relationship('PreventiveSchedule', backref='asset', lazy=True)
    sensor_readings = db.relationship('SensorReading', backref='asset', lazy=True)
    vehicle_detail = db.relationship('VehicleDetail', backref='asset', uselist=False, lazy=True)
    incidents = db.relationship('Incident', backref='asset', lazy=True)

class EntityType(enum.Enum):
    asset = 'asset'
    work_order = 'work_order'
    procedure = 'procedure'
    certification = 'certification'
    other = 'other'

class DocumentType(enum.Enum):
    manual = 'manual'
    plan = 'plan'
    certificate = 'certificate'
    photo = 'photo'
    video = 'video'
    other = 'other'

class Document(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(255))
    entity_type = db.Column(db.Enum(EntityType))
    entity_id = db.Column(db.Integer, nullable=False)
    type = db.Column(db.Enum(DocumentType))

class SkillType(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    users = db.relationship('UserSkill', backref='skill', lazy=True)

class UserSkill(db.Model):
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    skill_id = db.Column(db.Integer, db.ForeignKey('skill_type.id'), primary_key=True)

class Certification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    expiry_date = db.Column(db.Date)

class Warehouse(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    site_id = db.Column(db.Integer, db.ForeignKey('site.id'))
    location_id = db.Column(db.Integer, db.ForeignKey('location.id'))
    spare_parts = db.relationship('SparePart', backref='warehouse', lazy=True)

class SparePart(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    code = db.Column(db.String(255), unique=True)
    manufacturer_id = db.Column(db.Integer, db.ForeignKey('manufacturer.id'))
    compatibility = db.Column(db.JSON)
    min_stock = db.Column(db.Integer, default=0)
    current_stock = db.Column(db.Integer, default=0)
    warehouse_id = db.Column(db.Integer, db.ForeignKey('warehouse.id'))
    unit_price = db.Column(db.Numeric(15,2))
    purchase_requests = db.relationship('PurchaseRequest', backref='spare_part', lazy=True)
    inventory_movements = db.relationship('InventoryMovement', backref='spare_part', lazy=True)

class Supplier(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    contact = db.Column(db.Text)
    rating = db.Column(db.Numeric(3,1))
    purchase_orders = db.relationship('PurchaseOrder', backref='supplier', lazy=True)

class PurchaseRequestStatus(enum.Enum):
    pending = 'pending'
    approved = 'approved'
    rejected = 'rejected'
    fulfilled = 'fulfilled'

class PurchaseRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    spare_part_id = db.Column(db.Integer, db.ForeignKey('spare_part.id'))
    quantity = db.Column(db.Integer, nullable=False)
    requested_by_user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    status = db.Column(db.Enum(PurchaseRequestStatus))
    request_date = db.Column(db.DateTime, default=datetime.utcnow)
    purchase_orders = db.relationship('PurchaseOrder', backref='purchase_request', lazy=True)

class PurchaseOrderStatus(enum.Enum):
    ordered = 'ordered'
    received = 'received'
    partial = 'partial'
    canceled = 'canceled'

class PurchaseOrder(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    supplier_id = db.Column(db.Integer, db.ForeignKey('supplier.id'))
    purchase_request_id = db.Column(db.Integer, db.ForeignKey('purchase_request.id'))
    order_date = db.Column(db.Date)
    received_date = db.Column(db.Date)
    status = db.Column(db.Enum(PurchaseOrderStatus))
    inventory_movements = db.relationship('InventoryMovement', backref='purchase_order', lazy=True)

class InventoryMovementType(enum.Enum):
    in_ = 'in'
    out = 'out'
    transfer = 'transfer'

class InventoryMovement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    spare_part_id = db.Column(db.Integer, db.ForeignKey('spare_part.id'))
    type = db.Column(db.Enum(InventoryMovementType))
    quantity = db.Column(db.Integer, nullable=False)
    movement_date = db.Column(db.DateTime, default=datetime.utcnow)
    work_order_id = db.Column(db.Integer, db.ForeignKey('work_order.id'))
    purchase_order_id = db.Column(db.Integer, db.ForeignKey('purchase_order.id'))
    from_warehouse_id = db.Column(db.Integer, db.ForeignKey('warehouse.id'))
    to_warehouse_id = db.Column(db.Integer, db.ForeignKey('warehouse.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    work_order = db.relationship('WorkOrder', backref='inventory_movements', lazy=True)
    from_warehouse = db.relationship('Warehouse', foreign_keys=[from_warehouse_id], backref='movements_from', lazy=True)
    to_warehouse = db.relationship('Warehouse', foreign_keys=[to_warehouse_id], backref='movements_to', lazy=True)

class WorkOrderType(enum.Enum):
    preventive = 'preventive'
    corrective = 'corrective'
    predictive = 'predictive'
    autonomous = 'autonomous'

class WorkOrderPriority(enum.Enum):
    urgent = 'urgent'
    high = 'high'
    medium = 'medium'
    low = 'low'

class WorkOrderStatus(enum.Enum):
    created = 'created'
    approved = 'approved'
    assigned = 'assigned'
    executing = 'executing'
    closed = 'closed'

class WorkOrder(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    asset_id = db.Column(db.Integer, db.ForeignKey('asset.id'))
    type = db.Column(db.Enum(WorkOrderType))
    priority = db.Column(db.Enum(WorkOrderPriority))
    status = db.Column(db.Enum(WorkOrderStatus))
    description = db.Column(db.Text)
    created_by_user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    assigned_to_user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    start_date = db.Column(db.DateTime)
    end_date = db.Column(db.DateTime)
    estimated_time = db.Column(db.Integer)
    actual_time = db.Column(db.Integer)
    materials_used = db.Column(db.JSON)
    comments = db.Column(db.Text)
    signature = db.Column(db.String(255))
    photos_before = db.Column(db.JSON)
    photos_after = db.Column(db.JSON)
    site_id = db.Column(db.Integer, db.ForeignKey('site.id'))
    checklists = db.relationship('Checklist', backref='work_order', lazy=True)
    permits = db.relationship('Permit', backref='work_order', lazy=True)

class Checklist(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    tasks = db.Column(db.JSON)
    is_template = db.Column(db.Boolean, default=True)
    work_order_id = db.Column(db.Integer, db.ForeignKey('work_order.id'))
    asset_id = db.Column(db.Integer, db.ForeignKey('asset.id'))
    preventive_schedules = db.relationship('PreventiveSchedule', backref='checklist', lazy=True)

class PreventiveScheduleType(enum.Enum):
    time = 'time'
    usage = 'usage'
    condition = 'condition'

class PreventiveIntervalTime(enum.Enum):
    daily = 'daily'
    weekly = 'weekly'
    monthly = 'monthly'
    annual = 'annual'

class PreventiveUsageUnit(enum.Enum):
    hours = 'hours'
    km = 'km'
    cycles = 'cycles'

class PreventiveSchedule(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    asset_id = db.Column(db.Integer, db.ForeignKey('asset.id'))
    checklist_id = db.Column(db.Integer, db.ForeignKey('checklist.id'))
    schedule_type = db.Column(db.Enum(PreventiveScheduleType))
    interval_time = db.Column(db.Enum(PreventiveIntervalTime))
    interval_usage = db.Column(db.Integer)
    usage_unit = db.Column(db.Enum(PreventiveUsageUnit))
    last_executed = db.Column(db.Date)
    next_due = db.Column(db.Date)

class SensorType(enum.Enum):
    vibration = 'vibration'
    temperature = 'temperature'
    pressure = 'pressure'
    other = 'other'

class SensorReading(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    asset_id = db.Column(db.Integer, db.ForeignKey('asset.id'))
    sensor_type = db.Column(db.Enum(SensorType))
    value = db.Column(db.Numeric(10,2))
    reading_date = db.Column(db.DateTime, default=datetime.utcnow)
    is_anomalous = db.Column(db.Boolean, default=False)

class FuelType(enum.Enum):
    gasoline = 'gasoline'
    diesel = 'diesel'
    electric = 'electric'
    other = 'other'

class VehicleDetail(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    asset_id = db.Column(db.Integer, db.ForeignKey('asset.id'), unique=True)
    fuel_type = db.Column(db.Enum(FuelType))
    current_mileage = db.Column(db.Integer)
    last_mileage_check = db.Column(db.Date)
    license_plate = db.Column(db.String(50))
    insurance_expiry = db.Column(db.Date)
    registration_expiry = db.Column(db.Date)
    fuel_consumption = db.Column(db.Numeric(5,2))
    gps_enabled = db.Column(db.Boolean, default=False)

class IncidentType(enum.Enum):
    incident = 'incident'
    near_miss = 'near_miss'
    accident = 'accident'

class IncidentSeverity(enum.Enum):
    low = 'low'
    medium = 'medium'
    high = 'high'

class Incident(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.Text)
    incident_date = db.Column(db.DateTime, default=datetime.utcnow)
    asset_id = db.Column(db.Integer, db.ForeignKey('asset.id'))
    reported_by_user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    type = db.Column(db.Enum(IncidentType))
    severity = db.Column(db.Enum(IncidentSeverity))

class Permit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    work_order_id = db.Column(db.Integer, db.ForeignKey('work_order.id'))
    type = db.Column(db.String(255))
    issued_date = db.Column(db.Date)
    expiry_date = db.Column(db.Date)
    issued_by_user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

class ProcedureType(enum.Enum):
    LOTO = 'LOTO'
    safety = 'safety'
    operational = 'operational'
    other = 'other'

class Procedure(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    type = db.Column(db.Enum(ProcedureType))

class AuditType(enum.Enum):
    internal = 'internal'
    external = 'external'
    safety = 'safety'

class Audit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    audit_date = db.Column(db.Date)
    findings = db.Column(db.Text)
    site_id = db.Column(db.Integer, db.ForeignKey('site.id'))
    auditor_user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    type = db.Column(db.Enum(AuditType))

class NotificationType(enum.Enum):
    email = 'email'
    sms = 'sms'
    whatsapp = 'whatsapp'
    push = 'push'

class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    message = db.Column(db.Text)
    type = db.Column(db.Enum(NotificationType))
    sent_date = db.Column(db.DateTime, default=datetime.utcnow)
    is_read = db.Column(db.Boolean, default=False)

# Historia models (similar, pero para audit logs; no siempre necesarios en app, pero para completitud)
class HistoryBase:
    history_id = db.Column(db.Integer, primary_key=True)
    action = db.Column(db.Enum('insert', 'update', 'delete'))
    changed_by_user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    old_values = db.Column(db.JSON)
    new_values = db.Column(db.JSON)

class CompanyHistory(db.Model, HistoryBase):
    __tablename__ = 'companies_history'
    company_id = db.Column(db.Integer)

class SiteHistory(db.Model, HistoryBase):
    __tablename__ = 'sites_history'
    site_id = db.Column(db.Integer)

class UsersHistory(db.Model, HistoryBase):
    __tablename__ = 'users_history'
    user_id = db.Column(db.Integer)

class CategoriesHistory(db.Model, HistoryBase):
    __tablename__ = 'categories_history'
    category_id = db.Column(db.Integer)

class ManufacturersHistory(db.Model, HistoryBase):
    __tablename__ = 'manufacturers_history'
    manufacturer_id = db.Column(db.Integer)

class ModelsHistory(db.Model, HistoryBase):
    __tablename__ = 'models_history'
    model_id = db.Column(db.Integer)

class LocationsHistory(db.Model, HistoryBase):
    __tablename__ = 'locations_history'
    location_id = db.Column(db.Integer)

class AssetsHistory(db.Model, HistoryBase):
    __tablename__ = 'assets_history'
    asset_id = db.Column(db.Integer)

class DocumentsHistory(db.Model, HistoryBase):
    __tablename__ = 'documents_history'
    document_id = db.Column(db.Integer)

class SkillTypesHistory(db.Model, HistoryBase):
    __tablename__ = 'skill_types_history'
    skill_type_id = db.Column(db.Integer)

class UserSkillsHistory(db.Model, HistoryBase):
    __tablename__ = 'user_skills_history'
    user_id = db.Column(db.Integer)
    skill_id = db.Column(db.Integer)

class CertificationsHistory(db.Model, HistoryBase):
    __tablename__ = 'certifications_history'
    certification_id = db.Column(db.Integer)

class WarehousesHistory(db.Model, HistoryBase):
    __tablename__ = 'warehouses_history'
    warehouse_id = db.Column(db.Integer)

class SparePartsHistory(db.Model, HistoryBase):
    __tablename__ = 'spare_parts_history'
    spare_part_id = db.Column(db.Integer)

class SuppliersHistory(db.Model, HistoryBase):
    __tablename__ = 'suppliers_history'
    supplier_id = db.Column(db.Integer)

class PurchaseRequestsHistory(db.Model, HistoryBase):
    __tablename__ = 'purchase_requests_history'
    purchase_request_id = db.Column(db.Integer)

class PurchaseOrdersHistory(db.Model, HistoryBase):
    __tablename__ = 'purchase_orders_history'
    purchase_order_id = db.Column(db.Integer)

class InventoryMovementsHistory(db.Model, HistoryBase):
    __tablename__ = 'inventory_movements_history'
    inventory_movement_id = db.Column(db.Integer)

class WorkOrdersHistory(db.Model, HistoryBase):
    __tablename__ = 'work_orders_history'
    work_order_id = db.Column(db.Integer)

class ChecklistsHistory(db.Model, HistoryBase):
    __tablename__ = 'checklists_history'
    checklist_id = db.Column(db.Integer)

class PreventiveSchedulesHistory(db.Model, HistoryBase):
    __tablename__ = 'preventive_schedules_history'
    preventive_schedule_id = db.Column(db.Integer)

class SensorReadingsHistory(db.Model, HistoryBase):
    __tablename__ = 'sensor_readings_history'
    sensor_reading_id = db.Column(db.Integer)

class VehicleDetailsHistory(db.Model, HistoryBase):
    __tablename__ = 'vehicle_details_history'
    vehicle_detail_id = db.Column(db.Integer)

class IncidentsHistory(db.Model, HistoryBase):
    __tablename__ = 'incidents_history'
    incident_id = db.Column(db.Integer)

class PermitsHistory(db.Model, HistoryBase):
    __tablename__ = 'permits_history'
    permit_id = db.Column(db.Integer)

class ProceduresHistory(db.Model, HistoryBase):
    __tablename__ = 'procedures_history'
    procedure_id = db.Column(db.Integer)

class AuditsHistory(db.Model, HistoryBase):
    __tablename__ = 'audits_history'
    audit_id = db.Column(db.Integer)

class NotificationsHistory(db.Model, HistoryBase):
    __tablename__ = 'notifications_history'
    notification_id = db.Column(db.Integer)