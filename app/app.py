from flask import Flask
from flask_mail import Mail
from routes.maintenance import maintenance_bp
from extensions import mail # Tu objeto Mail debe ser global o pasado correctamente

app = Flask(__name__)

# Configuración SMTP (Idealmente usa variables de entorno: os.environ.get)
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'tu_email@gmail.com'
app.config['MAIL_PASSWORD'] = 'tu_password'

# Inicializar extensiones
mail.init_app(app)

# Registrar Blueprints
app.register_blueprint(maintenance_bp)

if __name__ == '__main__':
    app.run(debug=True, port=5000)