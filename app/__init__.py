from flask import Flask
from .models import db
from .extensions import mail

def create_app():
    """
    Application factory function.
    """
    app = Flask(__name__, instance_relative_config=True)

    # Configuración de la base de datos y otras extensiones
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///maintech.db' # Usando SQLite para pruebas
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USERNAME'] = 'tu_email@gmail.com'
    app.config['MAIL_PASSWORD'] = 'tu_password'

    # Inicializar extensiones
    db.init_app(app)
    mail.init_app(app)

    # Registrar Blueprints
    from .modules.assets.assets_blueprint import assets_bp
    app.register_blueprint(assets_bp)

    return app
