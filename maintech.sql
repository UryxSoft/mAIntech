CREATE TABLE companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE sites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    company_id INT,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    role ENUM('admin', 'supervisor', 'technician', 'operator', 'guest') NOT NULL, -- niveles de acceso según perfil
    site_id INT,
    company_id INT,
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE SET NULL,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE manufacturers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE models (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    manufacturer_id INT,
    FOREIGN KEY (manufacturer_id) REFERENCES manufacturers(id) ON DELETE SET NULL
);

CREATE TABLE locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_id INT,
    site_id INT,
    layout JSON, -- para mapa de activos
    FOREIGN KEY (parent_id) REFERENCES locations(id) ON DELETE CASCADE,
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE
);

CREATE TABLE assets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unique_code VARCHAR(255) UNIQUE NOT NULL, -- QR/RFID/serial
    name VARCHAR(255) NOT NULL,
    category_id INT,
    model_id INT,
    manufacturer_id INT,
    specs JSON, -- especificaciones técnicas
    location_id INT,
    site_id INT,
    value_initial DECIMAL(15,2),
    value_current DECIMAL(15,2),
    depreciation_method ENUM('straight_line', 'declining_balance', 'none'),
    purchase_date DATE,
    hierarchy_parent_id INT, -- para estructura jerárquica
    criticality ENUM('low', 'medium', 'high', 'critical'), -- para priorización
    warranty_expiry DATE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE SET NULL,
    FOREIGN KEY (manufacturer_id) REFERENCES manufacturers(id) ON DELETE SET NULL,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL,
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
    FOREIGN KEY (hierarchy_parent_id) REFERENCES assets(id) ON DELETE CASCADE
);

CREATE TABLE documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255),
    entity_type ENUM('asset', 'work_order', 'procedure', 'certification', 'other'),
    entity_id INT NOT NULL, -- referencia polimórfica a asset_id, work_order_id, etc.
    type ENUM('manual', 'plan', 'certificate', 'photo', 'video', 'other')
);

CREATE TABLE skill_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE user_skills (
    user_id INT,
    skill_id INT,
    PRIMARY KEY (user_id, skill_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skill_types(id) ON DELETE CASCADE
);

CREATE TABLE certifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    user_id INT,
    expiry_date DATE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE warehouses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    site_id INT,
    location_id INT,
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
);

CREATE TABLE spare_parts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(255) UNIQUE, -- QR/RFID
    manufacturer_id INT,
    compatibility JSON, -- compatibilidad por modelo de máquina
    min_stock INT DEFAULT 0,
    current_stock INT DEFAULT 0,
    warehouse_id INT,
    unit_price DECIMAL(15,2),
    FOREIGN KEY (manufacturer_id) REFERENCES manufacturers(id) ON DELETE SET NULL,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE SET NULL
);

CREATE TABLE suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact TEXT,
    rating DECIMAL(3,1) -- para evaluación
);

CREATE TABLE purchase_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    spare_part_id INT,
    quantity INT NOT NULL,
    requested_by_user_id INT,
    status ENUM('pending', 'approved', 'rejected', 'fulfilled'),
    request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (spare_part_id) REFERENCES spare_parts(id) ON DELETE CASCADE,
    FOREIGN KEY (requested_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE purchase_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_id INT,
    purchase_request_id INT,
    order_date DATE,
    received_date DATE,
    status ENUM('ordered', 'received', 'partial', 'canceled'),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
    FOREIGN KEY (purchase_request_id) REFERENCES purchase_requests(id) ON DELETE CASCADE
);

CREATE TABLE inventory_movements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    spare_part_id INT,
    type ENUM('in', 'out', 'transfer'),
    quantity INT NOT NULL,
    movement_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    work_order_id INT, -- si usado en OT
    purchase_order_id INT, -- si de compra
    from_warehouse_id INT,
    to_warehouse_id INT,
    user_id INT,
    FOREIGN KEY (spare_part_id) REFERENCES spare_parts(id) ON DELETE CASCADE,
    FOREIGN KEY (work_order_id) REFERENCES work_orders(id) ON DELETE SET NULL,
    FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE SET NULL,
    FOREIGN KEY (from_warehouse_id) REFERENCES warehouses(id) ON DELETE SET NULL,
    FOREIGN KEY (to_warehouse_id) REFERENCES warehouses(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE work_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT,
    type ENUM('preventive', 'corrective', 'predictive', 'autonomous'),
    priority ENUM('urgent', 'high', 'medium', 'low'),
    status ENUM('created', 'approved', 'assigned', 'executing', 'closed'),
    description TEXT,
    created_by_user_id INT,
    assigned_to_user_id INT,
    start_date DATETIME,
    end_date DATETIME,
    estimated_time INT, -- en minutos
    actual_time INT, -- en minutos
    materials_used JSON, -- repuestos utilizados
    comments TEXT,
    signature VARCHAR(255), -- path o token para firma digital
    photos_before JSON,
    photos_after JSON,
    site_id INT,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to_user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE SET NULL
);

CREATE TABLE checklists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tasks JSON, -- lista de tareas
    is_template BOOLEAN DEFAULT TRUE,
    work_order_id INT, -- si asociado a OT, sino template
    asset_id INT, -- para plantillas por activo
    FOREIGN KEY (work_order_id) REFERENCES work_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE SET NULL
);

CREATE TABLE preventive_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT,
    checklist_id INT, -- plantilla
    schedule_type ENUM('time', 'usage', 'condition'),
    interval_time ENUM('daily', 'weekly', 'monthly', 'annual'), -- si time
    interval_usage INT, -- horas/km/ciclos
    usage_unit ENUM('hours', 'km', 'cycles'),
    last_executed DATE,
    next_due DATE,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    FOREIGN KEY (checklist_id) REFERENCES checklists(id) ON DELETE SET NULL
);

CREATE TABLE sensor_readings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT,
    sensor_type ENUM('vibration', 'temperature', 'pressure', 'other'),
    value DECIMAL(10,2),
    reading_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_anomalous BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
);

CREATE TABLE vehicle_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT UNIQUE,
    fuel_type ENUM('gasoline', 'diesel', 'electric', 'other'),
    current_mileage INT,
    last_mileage_check DATE,
    license_plate VARCHAR(50),
    insurance_expiry DATE,
    registration_expiry DATE,
    fuel_consumption DECIMAL(5,2), -- por km o similar
    gps_enabled BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
);

CREATE TABLE incidents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    description TEXT,
    incident_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    asset_id INT,
    reported_by_user_id INT,
    type ENUM('incident', 'near_miss', 'accident'),
    severity ENUM('low', 'medium', 'high'),
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE SET NULL,
    FOREIGN KEY (reported_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE permits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    work_order_id INT,
    type VARCHAR(255), -- PTW type
    issued_date DATE,
    expiry_date DATE,
    issued_by_user_id INT,
    FOREIGN KEY (work_order_id) REFERENCES work_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (issued_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE procedures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('LOTO', 'safety', 'operational', 'other')
);

CREATE TABLE audits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    audit_date DATE,
    findings TEXT,
    site_id INT,
    auditor_user_id INT,
    type ENUM('internal', 'external', 'safety'),
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE SET NULL,
    FOREIGN KEY (auditor_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    message TEXT,
    type ENUM('email', 'sms', 'whatsapp', 'push'),
    sent_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tablas de historial para cada tabla principal
CREATE TABLE companies_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT,
    action ENUM('insert', 'update', 'delete'),
    changed_by_user_id INT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    old_values JSON,
    new_values JSON,
    FOREIGN KEY (changed_by_user_id) REFERENCES users(id)
);

CREATE TABLE sites_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    site_id INT,
    action ENUM('insert', 'update', 'delete'),
    changed_by_user_id INT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    old_values JSON,
    new_values JSON,
    FOREIGN KEY (changed_by_user_id) REFERENCES users(id)
);

CREATE TABLE users_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action ENUM('insert', 'update', 'delete'),
    changed_by_user_id INT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    old_values JSON,
    new_values JSON,
    FOREIGN KEY (changed_by_user_id) REFERENCES users(id)
);

CREATE TABLE categories_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT,
    action ENUM('insert', 'update', 'delete'),
    changed_by_user_id INT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    old_values JSON,
    new_values JSON,
    FOREIGN KEY (changed_by_user_id) REFERENCES users(id)
);

CREATE TABLE manufacturers_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    manufacturer_id INT,
    action ENUM('insert', 'update', 'delete'),
    changed_by_user_id INT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    old_values JSON,
    new_values JSON,
    FOREIGN KEY (changed_by_user_id) REFERENCES users(id)
);

CREATE TABLE models_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    model_id INT,
    action ENUM('insert', 'update', 'delete'),
    changed_by_user_id INT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    old_values JSON,
    new_values JSON,
    FOREIGN KEY (changed_by_user_id) REFERENCES users(id)
);

CREATE TABLE locations_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    location_id INT,
    action ENUM('insert', 'update', 'delete'),
    changed_by_user_id INT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    old_values JSON,
    new_values JSON,
    FOREIGN KEY (changed_by_user_id) REFERENCES users(id)
);

CREATE TABLE assets_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT,
    action ENUM('insert', 'update', 'delete'),
    changed_by_user_id INT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    old_values JSON,
    new_values JSON,
    FOREIGN KEY (changed_by_user_id) REFERENCES users(id)
);

CREATE TABLE documents_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    document_id INT,
    action ENUM('insert', 'update', 'delete'),
    changed_by_user_id INT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    old_values JSON,
    new_values JSON,
    FOREIGN KEY (changed_by_user_id) REFERENCES users(id)
);

CREATE TABLE skill_types_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    skill_type_id INT,
    action ENUM('insert', 'update', 'delete'),
    changed_by_user_id INT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    old_values JSON,
    new_values JSON,
    FOREIGN KEY (changed_by_user_id) REFERENCES users(id)
);

CREATE TABLE user_skills_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    skill_id INT,
    action ENUM('insert', 'update', 'delete'),
    changed_by_user_id INT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    old_values JSON,
    new_values JSON,
    FOREIGN KEY (changed_by_user_id) REFERENCES users(id)
);

CREATE TABLE certifications_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    certification_id INT,
    action ENUM('insert', 'update', 'delete'),
    changed_by_user_id INT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    old_values JSON,
    new_values JSON,
    FOREIGN KEY (changed_by_user_id) REFERENCES users(id)
);

CREATE TABLE warehouses_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    warehouse_id INT,
    action ENUM('insert', 'update', 'delete'),
    changed_by_user_id INT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    old_values JSON,
    new_values JSON,
    FOREIGN KEY (changed_by_user_id) REFERENCES users(id)
);

CREATE TABLE spare_parts_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    spare_part_id INT,
    action ENUM('insert', 'update', 'delete'),
    changed_by_user_id INT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    old_values JSON,
    new_values JSON,
    FOREIGN KEY (changed_by_user_id) REFERENCES users(id)
);

CREATE TABLE suppliers_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_id INT,
    action ENUM('insert', 'update', 'delete'),
    changed_by_user_id INT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    old_values JSON,
    new_values JSON,
    FOREIGN KEY (changed_by_user_id) REFERENCES users(id)
);

CREATE TABLE purchase_requests_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    purchase_request_id INT,
    action ENUM('insert', 'update', 'delete'),
    changed_by_user_id INT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    old_values JSON,
    new_values JSON,
    FOREIGN KEY (changed_by_user_id) REFERENCES users(id)
);

CREATE TABLE purchase_orders_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    purchase_order_id INT,
    action ENUM('insert', 'update', 'delete'),
    changed_by_user_id INT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    old_values JSON,
    new_values JSON,
    FOREIGN KEY (changed_by_user_id) REFERENCES users(id)
);

CREATE TABLE inventory_movements_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    inventory_movement_id INT,
    action ENUM('insert', 'update', 'delete'),
    changed_by_user_id INT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    old_values JSON,
    new_values JSON,
    FOREIGN KEY (changed_by_user_id) REFERENCES users(id)
);

CREATE TABLE work_orders_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    work_order_id INT,
    action ENUM('insert', 'update', 'delete'),
    changed_by_user_id INT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    old_values JSON,
    new_values JSON,
    FOREIGN KEY (changed_by_user_id) REFERENCES users(id)
);

CREATE TABLE checklists_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    checklist_id INT,
    action ENUM('insert', 'update', 'delete'),
    changed_by_user_id INT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    old_values JSON,
    new_values JSON,
    FOREIGN KEY (changed_by_user_id) REFERENCES users(id)
);

CREATE TABLE preventive_schedules_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    preventive_schedule_id INT,
    action ENUM('insert', 'update', 'delete'),
    changed_by_user_id INT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    old_values JSON,
    new_values JSON,
    FOREIGN KEY (changed_by_user_id) REFERENCES users(id)
);

CREATE TABLE sensor_readings_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    sensor_reading_id INT,
    action ENUM('insert', 'update', 'delete'),
    changed_by_user_id INT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    old_values JSON,
    new_values JSON,
    FOREIGN KEY (changed_by_user_id) REFERENCES users(id)
);

CREATE TABLE vehicle_details_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_detail_id INT,
    action ENUM('insert', 'update', 'delete'),
    changed_by_user_id INT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    old_values JSON,
    new_values JSON,
    FOREIGN KEY (changed_by_user_id) REFERENCES users(id)
);

CREATE TABLE incidents_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    incident_id INT,
    action ENUM('insert', 'update', 'delete'),
    changed_by_user_id INT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    old_values JSON,
    new_values JSON,
    FOREIGN KEY (changed_by_user_id) REFERENCES users(id)
);

CREATE TABLE permits_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    permit_id INT,
    action ENUM('insert', 'update', 'delete'),
    changed_by_user_id INT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    old_values JSON,
    new_values JSON,
    FOREIGN KEY (changed_by_user_id) REFERENCES users(id)
);

CREATE TABLE procedures_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    procedure_id INT,
    action ENUM('insert', 'update', 'delete'),
    changed_by_user_id INT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    old_values JSON,
    new_values JSON,
    FOREIGN KEY (changed_by_user_id) REFERENCES users(id)
);

CREATE TABLE audits_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    audit_id INT,
    action ENUM('insert', 'update', 'delete'),
    changed_by_user_id INT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    old_values JSON,
    new_values JSON,
    FOREIGN KEY (changed_by_user_id) REFERENCES users(id)
);

CREATE TABLE notifications_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    notification_id INT,
    action ENUM('insert', 'update', 'delete'),
    changed_by_user_id INT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    old_values JSON,
    new_values JSON,
    FOREIGN KEY (changed_by_user_id) REFERENCES users(id)
);

-- Triggers para historial (ejemplo para assets; replicar para cada tabla)

DELIMITER //
CREATE TRIGGER companies_after_insert
AFTER INSERT ON companies
FOR EACH ROW
BEGIN
INSERT INTO companies_history (company_id, action, changed_by_user_id, new_values)
VALUES (NEW.id, 'insert', @current_user_id, JSON_OBJECT('id', NEW.id, 'name', NEW.name));
END;
//
CREATE TRIGGER companies_after_update
AFTER UPDATE ON companies
FOR EACH ROW
BEGIN
INSERT INTO companies_history (company_id, action, changed_by_user_id, old_values, new_values)
VALUES (NEW.id, 'update', @current_user_id, JSON_OBJECT('id', OLD.id, 'name', OLD.name), JSON_OBJECT('id', NEW.id, 'name', NEW.name));
END;
//
CREATE TRIGGER companies_after_delete
AFTER DELETE ON companies
FOR EACH ROW
BEGIN
INSERT INTO companies_history (company_id, action, changed_by_user_id, old_values)
VALUES (OLD.id, 'delete', @current_user_id, JSON_OBJECT('id', OLD.id, 'name', OLD.name));
END;
//
CREATE TRIGGER sites_after_insert
AFTER INSERT ON sites
FOR EACH ROW
BEGIN
INSERT INTO sites_history (site_id, action, changed_by_user_id, new_values)
VALUES (NEW.id, 'insert', @current_user_id, JSON_OBJECT('id', NEW.id, 'name', NEW.name, 'address', NEW.address, 'company_id', NEW.company_id));
END;
//
CREATE TRIGGER sites_after_update
AFTER UPDATE ON sites
FOR EACH ROW
BEGIN
INSERT INTO sites_history (site_id, action, changed_by_user_id, old_values, new_values)
VALUES (NEW.id, 'update', @current_user_id, JSON_OBJECT('id', OLD.id, 'name', OLD.name, 'address', OLD.address, 'company_id', OLD.company_id), JSON_OBJECT('id', NEW.id, 'name', NEW.name, 'address', NEW.address, 'company_id', NEW.company_id));
END;
//
CREATE TRIGGER sites_after_delete
AFTER DELETE ON sites
FOR EACH ROW
BEGIN
INSERT INTO sites_history (site_id, action, changed_by_user_id, old_values)
VALUES (OLD.id, 'delete', @current_user_id, JSON_OBJECT('id', OLD.id, 'name', OLD.name, 'address', OLD.address, 'company_id', OLD.company_id));
END;
//
CREATE TRIGGER users_after_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
INSERT INTO users_history (user_id, action, changed_by_user_id, new_values)
VALUES (NEW.id, 'insert', @current_user_id, JSON_OBJECT('id', NEW.id, 'username', NEW.username, 'password_hash', NEW.password_hash, 'email', NEW.email, 'role', NEW.role, 'site_id', NEW.site_id, 'company_id', NEW.company_id));
END;
//
CREATE TRIGGER users_after_update
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
INSERT INTO users_history (user_id, action, changed_by_user_id, old_values, new_values)
VALUES (NEW.id, 'update', @current_user_id, JSON_OBJECT('id', OLD.id, 'username', OLD.username, 'password_hash', OLD.password_hash, 'email', OLD.email, 'role', OLD.role, 'site_id', OLD.site_id, 'company_id', OLD.company_id), JSON_OBJECT('id', NEW.id, 'username', NEW.username, 'password_hash', NEW.password_hash, 'email', NEW.email, 'role', NEW.role, 'site_id', NEW.site_id, 'company_id', NEW.company_id));
END;
//
CREATE TRIGGER users_after_delete
AFTER DELETE ON users
FOR EACH ROW
BEGIN
INSERT INTO users_history (user_id, action, changed_by_user_id, old_values)
VALUES (OLD.id, 'delete', @current_user_id, JSON_OBJECT('id', OLD.id, 'username', OLD.username, 'password_hash', OLD.password_hash, 'email', OLD.email, 'role', OLD.role, 'site_id', OLD.site_id, 'company_id', OLD.company_id));
END;
//
CREATE TRIGGER categories_after_insert
AFTER INSERT ON categories
FOR EACH ROW
BEGIN
INSERT INTO categories_history (category_id, action, changed_by_user_id, new_values)
VALUES (NEW.id, 'insert', @current_user_id, JSON_OBJECT('id', NEW.id, 'name', NEW.name));
END;
//
CREATE TRIGGER categories_after_update
AFTER UPDATE ON categories
FOR EACH ROW
BEGIN
INSERT INTO categories_history (category_id, action, changed_by_user_id, old_values, new_values)
VALUES (NEW.id, 'update', @current_user_id, JSON_OBJECT('id', OLD.id, 'name', OLD.name), JSON_OBJECT('id', NEW.id, 'name', NEW.name));
END;
//
CREATE TRIGGER categories_after_delete
AFTER DELETE ON categories
FOR EACH ROW
BEGIN
INSERT INTO categories_history (category_id, action, changed_by_user_id, old_values)
VALUES (OLD.id, 'delete', @current_user_id, JSON_OBJECT('id', OLD.id, 'name', OLD.name));
END;
//
CREATE TRIGGER manufacturers_after_insert
AFTER INSERT ON manufacturers
FOR EACH ROW
BEGIN
INSERT INTO manufacturers_history (manufacturer_id, action, changed_by_user_id, new_values)
VALUES (NEW.id, 'insert', @current_user_id, JSON_OBJECT('id', NEW.id, 'name', NEW.name));
END;
//
CREATE TRIGGER manufacturers_after_update
AFTER UPDATE ON manufacturers
FOR EACH ROW
BEGIN
INSERT INTO manufacturers_history (manufacturer_id, action, changed_by_user_id, old_values, new_values)
VALUES (NEW.id, 'update', @current_user_id, JSON_OBJECT('id', OLD.id, 'name', OLD.name), JSON_OBJECT('id', NEW.id, 'name', NEW.name));
END;
//
CREATE TRIGGER manufacturers_after_delete
AFTER DELETE ON manufacturers
FOR EACH ROW
BEGIN
INSERT INTO manufacturers_history (manufacturer_id, action, changed_by_user_id, old_values)
VALUES (OLD.id, 'delete', @current_user_id, JSON_OBJECT('id', OLD.id, 'name', OLD.name));
END;
//
CREATE TRIGGER models_after_insert
AFTER INSERT ON models
FOR EACH ROW
BEGIN
INSERT INTO models_history (model_id, action, changed_by_user_id, new_values)
VALUES (NEW.id, 'insert', @current_user_id, JSON_OBJECT('id', NEW.id, 'name', NEW.name, 'manufacturer_id', NEW.manufacturer_id));
END;
//
CREATE TRIGGER models_after_update
AFTER UPDATE ON models
FOR EACH ROW
BEGIN
INSERT INTO models_history (model_id, action, changed_by_user_id, old_values, new_values)
VALUES (NEW.id, 'update', @current_user_id, JSON_OBJECT('id', OLD.id, 'name', OLD.name, 'manufacturer_id', OLD.manufacturer_id), JSON_OBJECT('id', NEW.id, 'name', NEW.name, 'manufacturer_id', NEW.manufacturer_id));
END;
//
CREATE TRIGGER models_after_delete
AFTER DELETE ON models
FOR EACH ROW
BEGIN
INSERT INTO models_history (model_id, action, changed_by_user_id, old_values)
VALUES (OLD.id, 'delete', @current_user_id, JSON_OBJECT('id', OLD.id, 'name', OLD.name, 'manufacturer_id', OLD.manufacturer_id));
END;
//
CREATE TRIGGER locations_after_insert
AFTER INSERT ON locations
FOR EACH ROW
BEGIN
INSERT INTO locations_history (location_id, action, changed_by_user_id, new_values)
VALUES (NEW.id, 'insert', @current_user_id, JSON_OBJECT('id', NEW.id, 'name', NEW.name, 'parent_id', NEW.parent_id, 'site_id', NEW.site_id, 'layout', NEW.layout));
END;
//
CREATE TRIGGER locations_after_update
AFTER UPDATE ON locations
FOR EACH ROW
BEGIN
INSERT INTO locations_history (location_id, action, changed_by_user_id, old_values, new_values)
VALUES (NEW.id, 'update', @current_user_id, JSON_OBJECT('id', OLD.id, 'name', OLD.name, 'parent_id', OLD.parent_id, 'site_id', OLD.site_id, 'layout', OLD.layout), JSON_OBJECT('id', NEW.id, 'name', NEW.name, 'parent_id', NEW.parent_id, 'site_id', NEW.site_id, 'layout', NEW.layout));
END;
//
CREATE TRIGGER locations_after_delete
AFTER DELETE ON locations
FOR EACH ROW
BEGIN
INSERT INTO locations_history (location_id, action, changed_by_user_id, old_values)
VALUES (OLD.id, 'delete', @current_user_id, JSON_OBJECT('id', OLD.id, 'name', OLD.name, 'parent_id', OLD.parent_id, 'site_id', OLD.site_id, 'layout', OLD.layout));
END;
//
CREATE TRIGGER assets_after_insert
AFTER INSERT ON assets
FOR EACH ROW
BEGIN
INSERT INTO assets_history (asset_id, action, changed_by_user_id, new_values)
VALUES (NEW.id, 'insert', @current_user_id, JSON_OBJECT('id', NEW.id, 'unique_code', NEW.unique_code, 'name', NEW.name, 'category_id', NEW.category_id, 'model_id', NEW.model_id, 'manufacturer_id', NEW.manufacturer_id, 'specs', NEW.specs, 'location_id', NEW.location_id, 'site_id', NEW.site_id, 'value_initial', NEW.value_initial, 'value_current', NEW.value_current, 'depreciation_method', NEW.depreciation_method, 'purchase_date', NEW.purchase_date, 'hierarchy_parent_id', NEW.hierarchy_parent_id, 'criticality', NEW.criticality, 'warranty_expiry', NEW.warranty_expiry));
END;
//
CREATE TRIGGER assets_after_update
AFTER UPDATE ON assets
FOR EACH ROW
BEGIN
INSERT INTO assets_history (asset_id, action, changed_by_user_id, old_values, new_values)
VALUES (NEW.id, 'update', @current_user_id, JSON_OBJECT('id', OLD.id, 'unique_code', OLD.unique_code, 'name', OLD.name, 'category_id', OLD.category_id, 'model_id', OLD.model_id, 'manufacturer_id', OLD.manufacturer_id, 'specs', OLD.specs, 'location_id', OLD.location_id, 'site_id', OLD.site_id, 'value_initial', OLD.value_initial, 'value_current', OLD.value_current, 'depreciation_method', OLD.depreciation_method, 'purchase_date', OLD.purchase_date, 'hierarchy_parent_id', OLD.hierarchy_parent_id, 'criticality', OLD.criticality, 'warranty_expiry', OLD.warranty_expiry), JSON_OBJECT('id', NEW.id, 'unique_code', NEW.unique_code, 'name', NEW.name, 'category_id', NEW.category_id, 'model_id', NEW.model_id, 'manufacturer_id', NEW.manufacturer_id, 'specs', NEW.specs, 'location_id', NEW.location_id, 'site_id', NEW.site_id, 'value_initial', NEW.value_initial, 'value_current', NEW.value_current, 'depreciation_method', NEW.depreciation_method, 'purchase_date', NEW.purchase_date, 'hierarchy_parent_id', NEW.hierarchy_parent_id, 'criticality', NEW.criticality, 'warranty_expiry', NEW.warranty_expiry));
END;
//
CREATE TRIGGER assets_after_delete
AFTER DELETE ON assets
FOR EACH ROW
BEGIN
INSERT INTO assets_history (asset_id, action, changed_by_user_id, old_values)
VALUES (OLD.id, 'delete', @current_user_id, JSON_OBJECT('id', OLD.id, 'unique_code', OLD.unique_code, 'name', OLD.name, 'category_id', OLD.category_id, 'model_id', OLD.model_id, 'manufacturer_id', OLD.manufacturer_id, 'specs', OLD.specs, 'location_id', OLD.location_id, 'site_id', OLD.site_id, 'value_initial', OLD.value_initial, 'value_current', OLD.value_current, 'depreciation_method', OLD.depreciation_method, 'purchase_date', OLD.purchase_date, 'hierarchy_parent_id', OLD.hierarchy_parent_id, 'criticality', OLD.criticality, 'warranty_expiry', OLD.warranty_expiry));
END;
//
CREATE TRIGGER documents_after_insert
AFTER INSERT ON documents
FOR EACH ROW
BEGIN
INSERT INTO documents_history (document_id, action, changed_by_user_id, new_values)
VALUES (NEW.id, 'insert', @current_user_id, JSON_OBJECT('id', NEW.id, 'name', NEW.name, 'file_path', NEW.file_path, 'entity_type', NEW.entity_type, 'entity_id', NEW.entity_id, 'type', NEW.type));
END;
//
CREATE TRIGGER documents_after_update
AFTER UPDATE ON documents
FOR EACH ROW
BEGIN
INSERT INTO documents_history (document_id, action, changed_by_user_id, old_values, new_values)
VALUES (NEW.id, 'update', @current_user_id, JSON_OBJECT('id', OLD.id, 'name', OLD.name, 'file_path', OLD.file_path, 'entity_type', OLD.entity_type, 'entity_id', OLD.entity_id, 'type', OLD.type), JSON_OBJECT('id', NEW.id, 'name', NEW.name, 'file_path', NEW.file_path, 'entity_type', NEW.entity_type, 'entity_id', NEW.entity_id, 'type', NEW.type));
END;
//
CREATE TRIGGER documents_after_delete
AFTER DELETE ON documents
FOR EACH ROW
BEGIN
INSERT INTO documents_history (document_id, action, changed_by_user_id, old_values)
VALUES (OLD.id, 'delete', @current_user_id, JSON_OBJECT('id', OLD.id, 'name', OLD.name, 'file_path', OLD.file_path, 'entity_type', OLD.entity_type, 'entity_id', OLD.entity_id, 'type', OLD.type));
END;
//
CREATE TRIGGER skill_types_after_insert
AFTER INSERT ON skill_types
FOR EACH ROW
BEGIN
INSERT INTO skill_types_history (skill_type_id, action, changed_by_user_id, new_values)
VALUES (NEW.id, 'insert', @current_user_id, JSON_OBJECT('id', NEW.id, 'name', NEW.name));
END;
//
CREATE TRIGGER skill_types_after_update
AFTER UPDATE ON skill_types
FOR EACH ROW
BEGIN
INSERT INTO skill_types_history (skill_type_id, action, changed_by_user_id, old_values, new_values)
VALUES (NEW.id, 'update', @current_user_id, JSON_OBJECT('id', OLD.id, 'name', OLD.name), JSON_OBJECT('id', NEW.id, 'name', NEW.name));
END;
//
CREATE TRIGGER skill_types_after_delete
AFTER DELETE ON skill_types
FOR EACH ROW
BEGIN
INSERT INTO skill_types_history (skill_type_id, action, changed_by_user_id, old_values)
VALUES (OLD.id, 'delete', @current_user_id, JSON_OBJECT('id', OLD.id, 'name', OLD.name));
END;
//
CREATE TRIGGER user_skills_after_insert
AFTER INSERT ON user_skills
FOR EACH ROW
BEGIN
INSERT INTO user_skills_history (user_id, skill_id, action, changed_by_user_id, new_values)
VALUES (NEW.user_id, NEW.skill_id, 'insert', @current_user_id, JSON_OBJECT('user_id', NEW.user_id, 'skill_id', NEW.skill_id));
END;
//
CREATE TRIGGER user_skills_after_update
AFTER UPDATE ON user_skills
FOR EACH ROW
BEGIN
INSERT INTO user_skills_history (user_id, skill_id, action, changed_by_user_id, old_values, new_values)
VALUES (NEW.user_id, NEW.skill_id, 'update', @current_user_id, JSON_OBJECT('user_id', OLD.user_id, 'skill_id', OLD.skill_id), JSON_OBJECT('user_id', NEW.user_id, 'skill_id', NEW.skill_id));
END;
//
CREATE TRIGGER user_skills_after_delete
AFTER DELETE ON user_skills
FOR EACH ROW
BEGIN
INSERT INTO user_skills_history (user_id, skill_id, action, changed_by_user_id, old_values)
VALUES (OLD.user_id, OLD.skill_id, 'delete', @current_user_id, JSON_OBJECT('user_id', OLD.user_id, 'skill_id', OLD.skill_id));
END;
//
CREATE TRIGGER certifications_after_insert
AFTER INSERT ON certifications
FOR EACH ROW
BEGIN
INSERT INTO certifications_history (certification_id, action, changed_by_user_id, new_values)
VALUES (NEW.id, 'insert', @current_user_id, JSON_OBJECT('id', NEW.id, 'name', NEW.name, 'user_id', NEW.user_id, 'expiry_date', NEW.expiry_date));
END;
//
CREATE TRIGGER certifications_after_update
AFTER UPDATE ON certifications
FOR EACH ROW
BEGIN
INSERT INTO certifications_history (certification_id, action, changed_by_user_id, old_values, new_values)
VALUES (NEW.id, 'update', @current_user_id, JSON_OBJECT('id', OLD.id, 'name', OLD.name, 'user_id', OLD.user_id, 'expiry_date', OLD.expiry_date), JSON_OBJECT('id', NEW.id, 'name', NEW.name, 'user_id', NEW.user_id, 'expiry_date', NEW.expiry_date));
END;
//
CREATE TRIGGER certifications_after_delete
AFTER DELETE ON certifications
FOR EACH ROW
BEGIN
INSERT INTO certifications_history (certification_id, action, changed_by_user_id, old_values)
VALUES (OLD.id, 'delete', @current_user_id, JSON_OBJECT('id', OLD.id, 'name', OLD.name, 'user_id', OLD.user_id, 'expiry_date', OLD.expiry_date));
END;
//
CREATE TRIGGER warehouses_after_insert
AFTER INSERT ON warehouses
FOR EACH ROW
BEGIN
INSERT INTO warehouses_history (warehouse_id, action, changed_by_user_id, new_values)
VALUES (NEW.id, 'insert', @current_user_id, JSON_OBJECT('id', NEW.id, 'name', NEW.name, 'site_id', NEW.site_id, 'location_id', NEW.location_id));
END;
//
CREATE TRIGGER warehouses_after_update
AFTER UPDATE ON warehouses
FOR EACH ROW
BEGIN
INSERT INTO warehouses_history (warehouse_id, action, changed_by_user_id, old_values, new_values)
VALUES (NEW.id, 'update', @current_user_id, JSON_OBJECT('id', OLD.id, 'name', OLD.name, 'site_id', OLD.site_id, 'location_id', OLD.location_id), JSON_OBJECT('id', NEW.id, 'name', NEW.name, 'site_id', NEW.site_id, 'location_id', NEW.location_id));
END;
//
CREATE TRIGGER warehouses_after_delete
AFTER DELETE ON warehouses
FOR EACH ROW
BEGIN
INSERT INTO warehouses_history (warehouse_id, action, changed_by_user_id, old_values)
VALUES (OLD.id, 'delete', @current_user_id, JSON_OBJECT('id', OLD.id, 'name', OLD.name, 'site_id', OLD.site_id, 'location_id', OLD.location_id));
END;
//
CREATE TRIGGER spare_parts_after_insert
AFTER INSERT ON spare_parts
FOR EACH ROW
BEGIN
INSERT INTO spare_parts_history (spare_part_id, action, changed_by_user_id, new_values)
VALUES (NEW.id, 'insert', @current_user_id, JSON_OBJECT('id', NEW.id, 'name', NEW.name, 'code', NEW.code, 'manufacturer_id', NEW.manufacturer_id, 'compatibility', NEW.compatibility, 'min_stock', NEW.min_stock, 'current_stock', NEW.current_stock, 'warehouse_id', NEW.warehouse_id, 'unit_price', NEW.unit_price));
END;
//
CREATE TRIGGER spare_parts_after_update
AFTER UPDATE ON spare_parts
FOR EACH ROW
BEGIN
INSERT INTO spare_parts_history (spare_part_id, action, changed_by_user_id, old_values, new_values)
VALUES (NEW.id, 'update', @current_user_id, JSON_OBJECT('id', OLD.id, 'name', OLD.name, 'code', OLD.code, 'manufacturer_id', OLD.manufacturer_id, 'compatibility', OLD.compatibility, 'min_stock', OLD.min_stock, 'current_stock', OLD.current_stock, 'warehouse_id', OLD.warehouse_id, 'unit_price', OLD.unit_price), JSON_OBJECT('id', NEW.id, 'name', NEW.name, 'code', NEW.code, 'manufacturer_id', NEW.manufacturer_id, 'compatibility', NEW.compatibility, 'min_stock', NEW.min_stock, 'current_stock', NEW.current_stock, 'warehouse_id', NEW.warehouse_id, 'unit_price', NEW.unit_price));
END;
//
CREATE TRIGGER spare_parts_after_delete
AFTER DELETE ON spare_parts
FOR EACH ROW
BEGIN
INSERT INTO spare_parts_history (spare_part_id, action, changed_by_user_id, old_values)
VALUES (OLD.id, 'delete', @current_user_id, JSON_OBJECT('id', OLD.id, 'name', OLD.name, 'code', OLD.code, 'manufacturer_id', OLD.manufacturer_id, 'compatibility', OLD.compatibility, 'min_stock', OLD.min_stock, 'current_stock', OLD.current_stock, 'warehouse_id', OLD.warehouse_id, 'unit_price', OLD.unit_price));
END;
//
CREATE TRIGGER suppliers_after_insert
AFTER INSERT ON suppliers
FOR EACH ROW
BEGIN
INSERT INTO suppliers_history (supplier_id, action, changed_by_user_id, new_values)
VALUES (NEW.id, 'insert', @current_user_id, JSON_OBJECT('id', NEW.id, 'name', NEW.name, 'contact', NEW.contact, 'rating', NEW.rating));
END;
//
CREATE TRIGGER suppliers_after_update
AFTER UPDATE ON suppliers
FOR EACH ROW
BEGIN
INSERT INTO suppliers_history (supplier_id, action, changed_by_user_id, old_values, new_values)
VALUES (NEW.id, 'update', @current_user_id, JSON_OBJECT('id', OLD.id, 'name', OLD.name, 'contact', OLD.contact, 'rating', OLD.rating), JSON_OBJECT('id', NEW.id, 'name', NEW.name, 'contact', NEW.contact, 'rating', NEW.rating));
END;
//
CREATE TRIGGER suppliers_after_delete
AFTER DELETE ON suppliers
FOR EACH ROW
BEGIN
INSERT INTO suppliers_history (supplier_id, action, changed_by_user_id, old_values)
VALUES (OLD.id, 'delete', @current_user_id, JSON_OBJECT('id', OLD.id, 'name', OLD.name, 'contact', OLD.contact, 'rating', OLD.rating));
END;
//
CREATE TRIGGER purchase_requests_after_insert
AFTER INSERT ON purchase_requests
FOR EACH ROW
BEGIN
INSERT INTO purchase_requests_history (purchase_request_id, action, changed_by_user_id, new_values)
VALUES (NEW.id, 'insert', @current_user_id, JSON_OBJECT('id', NEW.id, 'spare_part_id', NEW.spare_part_id, 'quantity', NEW.quantity, 'requested_by_user_id', NEW.requested_by_user_id, 'status', NEW.status, 'request_date', NEW.request_date));
END;
//
CREATE TRIGGER purchase_requests_after_update
AFTER UPDATE ON purchase_requests
FOR EACH ROW
BEGIN
INSERT INTO purchase_requests_history (purchase_request_id, action, changed_by_user_id, old_values, new_values)
VALUES (NEW.id, 'update', @current_user_id, JSON_OBJECT('id', OLD.id, 'spare_part_id', OLD.spare_part_id, 'quantity', OLD.quantity, 'requested_by_user_id', OLD.requested_by_user_id, 'status', OLD.status, 'request_date', OLD.request_date), JSON_OBJECT('id', NEW.id, 'spare_part_id', NEW.spare_part_id, 'quantity', NEW.quantity, 'requested_by_user_id', NEW.requested_by_user_id, 'status', NEW.status, 'request_date', NEW.request_date));
END;
//
CREATE TRIGGER purchase_requests_after_delete
AFTER DELETE ON purchase_requests
FOR EACH ROW
BEGIN
INSERT INTO purchase_requests_history (purchase_request_id, action, changed_by_user_id, old_values)
VALUES (OLD.id, 'delete', @current_user_id, JSON_OBJECT('id', OLD.id, 'spare_part_id', OLD.spare_part_id, 'quantity', OLD.quantity, 'requested_by_user_id', OLD.requested_by_user_id, 'status', OLD.status, 'request_date', OLD.request_date));
END;
//
CREATE TRIGGER purchase_orders_after_insert
AFTER INSERT ON purchase_orders
FOR EACH ROW
BEGIN
INSERT INTO purchase_orders_history (purchase_order_id, action, changed_by_user_id, new_values)
VALUES (NEW.id, 'insert', @current_user_id, JSON_OBJECT('id', NEW.id, 'supplier_id', NEW.supplier_id, 'purchase_request_id', NEW.purchase_request_id, 'order_date', NEW.order_date, 'received_date', NEW.received_date, 'status', NEW.status));
END;
//
CREATE TRIGGER purchase_orders_after_update
AFTER UPDATE ON purchase_orders
FOR EACH ROW
BEGIN
INSERT INTO purchase_orders_history (purchase_order_id, action, changed_by_user_id, old_values, new_values)
VALUES (NEW.id, 'update', @current_user_id, JSON_OBJECT('id', OLD.id, 'supplier_id', OLD.supplier_id, 'purchase_request_id', OLD.purchase_request_id, 'order_date', OLD.order_date, 'received_date', OLD.received_date, 'status', OLD.status), JSON_OBJECT('id', NEW.id, 'supplier_id', NEW.supplier_id, 'purchase_request_id', NEW.purchase_request_id, 'order_date', NEW.order_date, 'received_date', NEW.received_date, 'status', NEW.status));
END;
//
CREATE TRIGGER purchase_orders_after_delete
AFTER DELETE ON purchase_orders
FOR EACH ROW
BEGIN
INSERT INTO purchase_orders_history (purchase_order_id, action, changed_by_user_id, old_values)
VALUES (OLD.id, 'delete', @current_user_id, JSON_OBJECT('id', OLD.id, 'supplier_id', OLD.supplier_id, 'purchase_request_id', OLD.purchase_request_id, 'order_date', OLD.order_date, 'received_date', OLD.received_date, 'status', OLD.status));
END;
//
CREATE TRIGGER inventory_movements_after_insert
AFTER INSERT ON inventory_movements
FOR EACH ROW
BEGIN
INSERT INTO inventory_movements_history (inventory_movement_id, action, changed_by_user_id, new_values)
VALUES (NEW.id, 'insert', @current_user_id, JSON_OBJECT('id', NEW.id, 'spare_part_id', NEW.spare_part_id, 'type', NEW.type, 'quantity', NEW.quantity, 'movement_date', NEW.movement_date, 'work_order_id', NEW.work_order_id, 'purchase_order_id', NEW.purchase_order_id, 'from_warehouse_id', NEW.from_warehouse_id, 'to_warehouse_id', NEW.to_warehouse_id, 'user_id', NEW.user_id));
END;
//
CREATE TRIGGER inventory_movements_after_update
AFTER UPDATE ON inventory_movements
FOR EACH ROW
BEGIN
INSERT INTO inventory_movements_history (inventory_movement_id, action, changed_by_user_id, old_values, new_values)
VALUES (NEW.id, 'update', @current_user_id, JSON_OBJECT('id', OLD.id, 'spare_part_id', OLD.spare_part_id, 'type', OLD.type, 'quantity', OLD.quantity, 'movement_date', OLD.movement_date, 'work_order_id', OLD.work_order_id, 'purchase_order_id', OLD.purchase_order_id, 'from_warehouse_id', OLD.from_warehouse_id, 'to_warehouse_id', OLD.to_warehouse_id, 'user_id', OLD.user_id), JSON_OBJECT('id', NEW.id, 'spare_part_id', NEW.spare_part_id, 'type', NEW.type, 'quantity', NEW.quantity, 'movement_date', NEW.movement_date, 'work_order_id', NEW.work_order_id, 'purchase_order_id', NEW.purchase_order_id, 'from_warehouse_id', NEW.from_warehouse_id, 'to_warehouse_id', NEW.to_warehouse_id, 'user_id', NEW.user_id));
END;
//
CREATE TRIGGER inventory_movements_after_delete
AFTER DELETE ON inventory_movements
FOR EACH ROW
BEGIN
INSERT INTO inventory_movements_history (inventory_movement_id, action, changed_by_user_id, old_values)
VALUES (OLD.id, 'delete', @current_user_id, JSON_OBJECT('id', OLD.id, 'spare_part_id', OLD.spare_part_id, 'type', OLD.type, 'quantity', OLD.quantity, 'movement_date', OLD.movement_date, 'work_order_id', OLD.work_order_id, 'purchase_order_id', OLD.purchase_order_id, 'from_warehouse_id', OLD.from_warehouse_id, 'to_warehouse_id', OLD.to_warehouse_id, 'user_id', OLD.user_id));
END;
//
CREATE TRIGGER work_orders_after_insert
AFTER INSERT ON work_orders
FOR EACH ROW
BEGIN
INSERT INTO work_orders_history (work_order_id, action, changed_by_user_id, new_values)
VALUES (NEW.id, 'insert', @current_user_id, JSON_OBJECT('id', NEW.id, 'asset_id', NEW.asset_id, 'type', NEW.type, 'priority', NEW.priority, 'status', NEW.status, 'description', NEW.description, 'created_by_user_id', NEW.created_by_user_id, 'assigned_to_user_id', NEW.assigned_to_user_id, 'start_date', NEW.start_date, 'end_date', NEW.end_date, 'estimated_time', NEW.estimated_time, 'actual_time', NEW.actual_time, 'materials_used', NEW.materials_used, 'comments', NEW.comments, 'signature', NEW.signature, 'photos_before', NEW.photos_before, 'photos_after', NEW.photos_after, 'site_id', NEW.site_id));
END;
//
CREATE TRIGGER work_orders_after_update
AFTER UPDATE ON work_orders
FOR EACH ROW
BEGIN
INSERT INTO work_orders_history (work_order_id, action, changed_by_user_id, old_values, new_values)
VALUES (NEW.id, 'update', @current_user_id, JSON_OBJECT('id', OLD.id, 'asset_id', OLD.asset_id, 'type', OLD.type, 'priority', OLD.priority, 'status', OLD.status, 'description', OLD.description, 'created_by_user_id', OLD.created_by_user_id, 'assigned_to_user_id', OLD.assigned_to_user_id, 'start_date', OLD.start_date, 'end_date', OLD.end_date, 'estimated_time', OLD.estimated_time, 'actual_time', OLD.actual_time, 'materials_used', OLD.materials_used, 'comments', OLD.comments, 'signature', OLD.signature, 'photos_before', OLD.photos_before, 'photos_after', OLD.photos_after, 'site_id', OLD.site_id), JSON_OBJECT('id', NEW.id, 'asset_id', NEW.asset_id, 'type', NEW.type, 'priority', NEW.priority, 'status', NEW.status, 'description', NEW.description, 'created_by_user_id', NEW.created_by_user_id, 'assigned_to_user_id', NEW.assigned_to_user_id, 'start_date', NEW.start_date, 'end_date', NEW.end_date, 'estimated_time', NEW.estimated_time, 'actual_time', NEW.actual_time, 'materials_used', NEW.materials_used, 'comments', NEW.comments, 'signature', NEW.signature, 'photos_before', NEW.photos_before, 'photos_after', NEW.photos_after, 'site_id', NEW.site_id));
END;
//
CREATE TRIGGER work_orders_after_delete
AFTER DELETE ON work_orders
FOR EACH ROW
BEGIN
INSERT INTO work_orders_history (work_order_id, action, changed_by_user_id, old_values)
VALUES (OLD.id, 'delete', @current_user_id, JSON_OBJECT('id', OLD.id, 'asset_id', OLD.asset_id, 'type', OLD.type, 'priority', OLD.priority, 'status', OLD.status, 'description', OLD.description, 'created_by_user_id', OLD.created_by_user_id, 'assigned_to_user_id', OLD.assigned_to_user_id, 'start_date', OLD.start_date, 'end_date', OLD.end_date, 'estimated_time', OLD.estimated_time, 'actual_time', OLD.actual_time, 'materials_used', OLD.materials_used, 'comments', OLD.comments, 'signature', OLD.signature, 'photos_before', OLD.photos_before, 'photos_after', OLD.photos_after, 'site_id', OLD.site_id));
END;
//
CREATE TRIGGER checklists_after_insert
AFTER INSERT ON checklists
FOR EACH ROW
BEGIN
INSERT INTO checklists_history (checklist_id, action, changed_by_user_id, new_values)
VALUES (NEW.id, 'insert', @current_user_id, JSON_OBJECT('id', NEW.id, 'name', NEW.name, 'tasks', NEW.tasks, 'is_template', NEW.is_template, 'work_order_id', NEW.work_order_id, 'asset_id', NEW.asset_id));
END;
//
CREATE TRIGGER checklists_after_update
AFTER UPDATE ON checklists
FOR EACH ROW
BEGIN
INSERT INTO checklists_history (checklist_id, action, changed_by_user_id, old_values, new_values)
VALUES (NEW.id, 'update', @current_user_id, JSON_OBJECT('id', OLD.id, 'name', OLD.name, 'tasks', OLD.tasks, 'is_template', OLD.is_template, 'work_order_id', OLD.work_order_id, 'asset_id', OLD.asset_id), JSON_OBJECT('id', NEW.id, 'name', NEW.name, 'tasks', NEW.tasks, 'is_template', NEW.is_template, 'work_order_id', NEW.work_order_id, 'asset_id', NEW.asset_id));
END;
//
CREATE TRIGGER checklists_after_delete
AFTER DELETE ON checklists
FOR EACH ROW
BEGIN
INSERT INTO checklists_history (checklist_id, action, changed_by_user_id, old_values)
VALUES (OLD.id, 'delete', @current_user_id, JSON_OBJECT('id', OLD.id, 'name', OLD.name, 'tasks', OLD.tasks, 'is_template', OLD.is_template, 'work_order_id', OLD.work_order_id, 'asset_id', OLD.asset_id));
END;
//
CREATE TRIGGER preventive_schedules_after_insert
AFTER INSERT ON preventive_schedules
FOR EACH ROW
BEGIN
INSERT INTO preventive_schedules_history (preventive_schedule_id, action, changed_by_user_id, new_values)
VALUES (NEW.id, 'insert', @current_user_id, JSON_OBJECT('id', NEW.id, 'asset_id', NEW.asset_id, 'checklist_id', NEW.checklist_id, 'schedule_type', NEW.schedule_type, 'interval_time', NEW.interval_time, 'interval_usage', NEW.interval_usage, 'usage_unit', NEW.usage_unit, 'last_executed', NEW.last_executed, 'next_due', NEW.next_due));
END;
//
CREATE TRIGGER preventive_schedules_after_update
AFTER UPDATE ON preventive_schedules
FOR EACH ROW
BEGIN
INSERT INTO preventive_schedules_history (preventive_schedule_id, action, changed_by_user_id, old_values, new_values)
VALUES (NEW.id, 'update', @current_user_id, JSON_OBJECT('id', OLD.id, 'asset_id', OLD.asset_id, 'checklist_id', OLD.checklist_id, 'schedule_type', OLD.schedule_type, 'interval_time', OLD.interval_time, 'interval_usage', OLD.interval_usage, 'usage_unit', OLD.usage_unit, 'last_executed', OLD.last_executed, 'next_due', OLD.next_due), JSON_OBJECT('id', NEW.id, 'asset_id', NEW.asset_id, 'checklist_id', NEW.checklist_id, 'schedule_type', NEW.schedule_type, 'interval_time', NEW.interval_time, 'interval_usage', NEW.interval_usage, 'usage_unit', NEW.usage_unit, 'last_executed', NEW.last_executed, 'next_due', NEW.next_due));
END;
//
CREATE TRIGGER preventive_schedules_after_delete
AFTER DELETE ON preventive_schedules
FOR EACH ROW
BEGIN
INSERT INTO preventive_schedules_history (preventive_schedule_id, action, changed_by_user_id, old_values)
VALUES (OLD.id, 'delete', @current_user_id, JSON_OBJECT('id', OLD.id, 'asset_id', OLD.asset_id, 'checklist_id', OLD.checklist_id, 'schedule_type', OLD.schedule_type, 'interval_time', OLD.interval_time, 'interval_usage', OLD.interval_usage, 'usage_unit', OLD.usage_unit, 'last_executed', OLD.last_executed, 'next_due', OLD.next_due));
END;
//
CREATE TRIGGER sensor_readings_after_insert
AFTER INSERT ON sensor_readings
FOR EACH ROW
BEGIN
INSERT INTO sensor_readings_history (sensor_reading_id, action, changed_by_user_id, new_values)
VALUES (NEW.id, 'insert', @current_user_id, JSON_OBJECT('id', NEW.id, 'asset_id', NEW.asset_id, 'sensor_type', NEW.sensor_type, 'value', NEW.value, 'reading_date', NEW.reading_date, 'is_anomalous', NEW.is_anomalous));
END;
//
CREATE TRIGGER sensor_readings_after_update
AFTER UPDATE ON sensor_readings
FOR EACH ROW
BEGIN
INSERT INTO sensor_readings_history (sensor_reading_id, action, changed_by_user_id, old_values, new_values)
VALUES (NEW.id, 'update', @current_user_id, JSON_OBJECT('id', OLD.id, 'asset_id', OLD.asset_id, 'sensor_type', OLD.sensor_type, 'value', OLD.value, 'reading_date', OLD.reading_date, 'is_anomalous', OLD.is_anomalous), JSON_OBJECT('id', NEW.id, 'asset_id', NEW.asset_id, 'sensor_type', NEW.sensor_type, 'value', NEW.value, 'reading_date', NEW.reading_date, 'is_anomalous', NEW.is_anomalous));
END;
//
CREATE TRIGGER sensor_readings_after_delete
AFTER DELETE ON sensor_readings
FOR EACH ROW
BEGIN
INSERT INTO sensor_readings_history (sensor_reading_id, action, changed_by_user_id, old_values)
VALUES (OLD.id, 'delete', @current_user_id, JSON_OBJECT('id', OLD.id, 'asset_id', OLD.asset_id, 'sensor_type', OLD.sensor_type, 'value', OLD.value, 'reading_date', OLD.reading_date, 'is_anomalous', OLD.is_anomalous));
END;
//
CREATE TRIGGER vehicle_details_after_insert
AFTER INSERT ON vehicle_details
FOR EACH ROW
BEGIN
INSERT INTO vehicle_details_history (vehicle_detail_id, action, changed_by_user_id, new_values)
VALUES (NEW.id, 'insert', @current_user_id, JSON_OBJECT('id', NEW.id, 'asset_id', NEW.asset_id, 'fuel_type', NEW.fuel_type, 'current_mileage', NEW.current_mileage, 'last_mileage_check', NEW.last_mileage_check, 'license_plate', NEW.license_plate, 'insurance_expiry', NEW.insurance_expiry, 'registration_expiry', NEW.registration_expiry, 'fuel_consumption', NEW.fuel_consumption, 'gps_enabled', NEW.gps_enabled));
END;
//
CREATE TRIGGER vehicle_details_after_update
AFTER UPDATE ON vehicle_details
FOR EACH ROW
BEGIN
INSERT INTO vehicle_details_history (vehicle_detail_id, action, changed_by_user_id, old_values, new_values)
VALUES (NEW.id, 'update', @current_user_id, JSON_OBJECT('id', OLD.id, 'asset_id', OLD.asset_id, 'fuel_type', OLD.fuel_type, 'current_mileage', OLD.current_mileage, 'last_mileage_check', OLD.last_mileage_check, 'license_plate', OLD.license_plate, 'insurance_expiry', OLD.insurance_expiry, 'registration_expiry', OLD.registration_expiry, 'fuel_consumption', OLD.fuel_consumption, 'gps_enabled', OLD.gps_enabled), JSON_OBJECT('id', NEW.id, 'asset_id', NEW.asset_id, 'fuel_type', NEW.fuel_type, 'current_mileage', NEW.current_mileage, 'last_mileage_check', NEW.last_mileage_check, 'license_plate', NEW.license_plate, 'insurance_expiry', NEW.insurance_expiry, 'registration_expiry', NEW.registration_expiry, 'fuel_consumption', NEW.fuel_consumption, 'gps_enabled', NEW.gps_enabled));
END;
//
CREATE TRIGGER vehicle_details_after_delete
AFTER DELETE ON vehicle_details
FOR EACH ROW
BEGIN
INSERT INTO vehicle_details_history (vehicle_detail_id, action, changed_by_user_id, old_values)
VALUES (OLD.id, 'delete', @current_user_id, JSON_OBJECT('id', OLD.id, 'asset_id', OLD.asset_id, 'fuel_type', OLD.fuel_type, 'current_mileage', OLD.current_mileage, 'last_mileage_check', OLD.last_mileage_check, 'license_plate', OLD.license_plate, 'insurance_expiry', OLD.insurance_expiry, 'registration_expiry', OLD.registration_expiry, 'fuel_consumption', OLD.fuel_consumption, 'gps_enabled', OLD.gps_enabled));
END;
//
CREATE TRIGGER incidents_after_insert
AFTER INSERT ON incidents
FOR EACH ROW
BEGIN
INSERT INTO incidents_history (incident_id, action, changed_by_user_id, new_values)
VALUES (NEW.id, 'insert', @current_user_id, JSON_OBJECT('id', NEW.id, 'description', NEW.description, 'incident_date', NEW.incident_date, 'asset_id', NEW.asset_id, 'reported_by_user_id', NEW.reported_by_user_id, 'type', NEW.type, 'severity', NEW.severity));
END;
//
CREATE TRIGGER incidents_after_update
AFTER UPDATE ON incidents
FOR EACH ROW
BEGIN
INSERT INTO incidents_history (incident_id, action, changed_by_user_id, old_values, new_values)
VALUES (NEW.id, 'update', @current_user_id, JSON_OBJECT('id', OLD.id, 'description', OLD.description, 'incident_date', OLD.incident_date, 'asset_id', OLD.asset_id, 'reported_by_user_id', OLD.reported_by_user_id, 'type', OLD.type, 'severity', OLD.severity), JSON_OBJECT('id', NEW.id, 'description', NEW.description, 'incident_date', NEW.incident_date, 'asset_id', NEW.asset_id, 'reported_by_user_id', NEW.reported_by_user_id, 'type', NEW.type, 'severity', NEW.severity));
END;
//
CREATE TRIGGER incidents_after_delete
AFTER DELETE ON incidents
FOR EACH ROW
BEGIN
INSERT INTO incidents_history (incident_id, action, changed_by_user_id, old_values)
VALUES (OLD.id, 'delete', @current_user_id, JSON_OBJECT('id', OLD.id, 'description', OLD.description, 'incident_date', OLD.incident_date, 'asset_id', OLD.asset_id, 'reported_by_user_id', OLD.reported_by_user_id, 'type', OLD.type, 'severity', OLD.severity));
END;
//
CREATE TRIGGER permits_after_insert
AFTER INSERT ON permits
FOR EACH ROW
BEGIN
INSERT INTO permits_history (permit_id, action, changed_by_user_id, new_values)
VALUES (NEW.id, 'insert', @current_user_id, JSON_OBJECT('id', NEW.id, 'work_order_id', NEW.work_order_id, 'type', NEW.type, 'issued_date', NEW.issued_date, 'expiry_date', NEW.expiry_date, 'issued_by_user_id', NEW.issued_by_user_id));
END;
//
CREATE TRIGGER permits_after_update
AFTER UPDATE ON permits
FOR EACH ROW
BEGIN
INSERT INTO permits_history (permit_id, action, changed_by_user_id, old_values, new_values)
VALUES (NEW.id, 'update', @current_user_id, JSON_OBJECT('id', OLD.id, 'work_order_id', OLD.work_order_id, 'type', OLD.type, 'issued_date', OLD.issued_date, 'expiry_date', OLD.expiry_date, 'issued_by_user_id', OLD.issued_by_user_id), JSON_OBJECT('id', NEW.id, 'work_order_id', NEW.work_order_id, 'type', NEW.type, 'issued_date', NEW.issued_date, 'expiry_date', NEW.expiry_date, 'issued_by_user_id', NEW.issued_by_user_id));
END;
//
CREATE TRIGGER permits_after_delete
AFTER DELETE ON permits
FOR EACH ROW
BEGIN
INSERT INTO permits_history (permit_id, action, changed_by_user_id, old_values)
VALUES (OLD.id, 'delete', @current_user_id, JSON_OBJECT('id', OLD.id, 'work_order_id', OLD.work_order_id, 'type', OLD.type, 'issued_date', OLD.issued_date, 'expiry_date', OLD.expiry_date, 'issued_by_user_id', OLD.issued_by_user_id));
END;
//
CREATE TRIGGER procedures_after_insert
AFTER INSERT ON procedures
FOR EACH ROW
BEGIN
INSERT INTO procedures_history (procedure_id, action, changed_by_user_id, new_values)
VALUES (NEW.id, 'insert', @current_user_id, JSON_OBJECT('id', NEW.id, 'name', NEW.name, 'description', NEW.description, 'type', NEW.type));
END;
//
CREATE TRIGGER procedures_after_update
AFTER UPDATE ON procedures
FOR EACH ROW
BEGIN
INSERT INTO procedures_history (procedure_id, action, changed_by_user_id, old_values, new_values)
VALUES (NEW.id, 'update', @current_user_id, JSON_OBJECT('id', OLD.id, 'name', OLD.name, 'description', OLD.description, 'type', OLD.type), JSON_OBJECT('id', NEW.id, 'name', NEW.name, 'description', NEW.description, 'type', NEW.type));
END;
//
CREATE TRIGGER procedures_after_delete
AFTER DELETE ON procedures
FOR EACH ROW
BEGIN
INSERT INTO procedures_history (procedure_id, action, changed_by_user_id, old_values)
VALUES (OLD.id, 'delete', @current_user_id, JSON_OBJECT('id', OLD.id, 'name', OLD.name, 'description', OLD.description, 'type', OLD.type));
END;
//
CREATE TRIGGER audits_after_insert
AFTER INSERT ON audits
FOR EACH ROW
BEGIN
INSERT INTO audits_history (audit_id, action, changed_by_user_id, new_values)
VALUES (NEW.id, 'insert', @current_user_id, JSON_OBJECT('id', NEW.id, 'audit_date', NEW.audit_date, 'findings', NEW.findings, 'site_id', NEW.site_id, 'auditor_user_id', NEW.auditor_user_id, 'type', NEW.type));
END;
//
CREATE TRIGGER audits_after_update
AFTER UPDATE ON audits
FOR EACH ROW
BEGIN
INSERT INTO audits_history (audit_id, action, changed_by_user_id, old_values, new_values)
VALUES (NEW.id, 'update', @current_user_id, JSON_OBJECT('id', OLD.id, 'audit_date', OLD.audit_date, 'findings', OLD.findings, 'site_id', OLD.site_id, 'auditor_user_id', OLD.auditor_user_id, 'type', OLD.type), JSON_OBJECT('id', NEW.id, 'audit_date', NEW.audit_date, 'findings', NEW.findings, 'site_id', NEW.site_id, 'auditor_user_id', NEW.auditor_user_id, 'type', NEW.type));
END;
//
CREATE TRIGGER audits_after_delete
AFTER DELETE ON audits
FOR EACH ROW
BEGIN
INSERT INTO audits_history (audit_id, action, changed_by_user_id, old_values)
VALUES (OLD.id, 'delete', @current_user_id, JSON_OBJECT('id', OLD.id, 'audit_date', OLD.audit_date, 'findings', OLD.findings, 'site_id', OLD.site_id, 'auditor_user_id', OLD.auditor_user_id, 'type', OLD.type));
END;
//
CREATE TRIGGER notifications_after_insert
AFTER INSERT ON notifications
FOR EACH ROW
BEGIN
INSERT INTO notifications_history (notification_id, action, changed_by_user_id, new_values)
VALUES (NEW.id, 'insert', @current_user_id, JSON_OBJECT('id', NEW.id, 'user_id', NEW.user_id, 'message', NEW.message, 'type', NEW.type, 'sent_date', NEW.sent_date, 'is_read', NEW.is_read));
END;
//
CREATE TRIGGER notifications_after_update
AFTER UPDATE ON notifications
FOR EACH ROW
BEGIN
INSERT INTO notifications_history (notification_id, action, changed_by_user_id, old_values, new_values)
VALUES (NEW.id, 'update', @current_user_id, JSON_OBJECT('id', OLD.id, 'user_id', OLD.user_id, 'message', OLD.message, 'type', OLD.type, 'sent_date', OLD.sent_date, 'is_read', OLD.is_read), JSON_OBJECT('id', NEW.id, 'user_id', NEW.user_id, 'message', NEW.message, 'type', NEW.type, 'sent_date', NEW.sent_date, 'is_read', NEW.is_read));
END;
//
CREATE TRIGGER notifications_after_delete
AFTER DELETE ON notifications
FOR EACH ROW
BEGIN
INSERT INTO notifications_history (notification_id, action, changed_by_user_id, old_values)
VALUES (OLD.id, 'delete', @current_user_id, JSON_OBJECT('id', OLD.id, 'user_id', OLD.user_id, 'message', OLD.message, 'type', OLD.type, 'sent_date', OLD.sent_date, 'is_read', OLD.is_read));
END;
//
DELIMITER ;