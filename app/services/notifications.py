import logging
from threading import Thread
from flask import current_app, render_template
from flask_mail import Message

# Configuración básica de logs
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class NotificationService:
    def __init__(self, mail):
        self.mail = mail

    def _async_send(self, app, msg):
        """Envío asíncrono real con contexto de aplicación."""
        with app.app_context():
            try:
                self.mail.send(msg)
                logger.info(f"✅ Correo enviado exitosamente a: {msg.recipients}")
            except Exception as e:
                logger.error(f"❌ Error crítico enviando correo: {str(e)}")

    def send_notification(self, subject, recipients, template, **kwargs):
        """Constructor genérico de correos."""
        try:
            app = current_app._get_current_object()
            msg = Message(subject, recipients=recipients)
            msg.html = render_template(f"emails/{template}.html", **kwargs)
            
            # Hilo para no bloquear la respuesta HTTP
            Thread(target=self._async_send, args=(app, msg)).start()
        except Exception as e:
            logger.error(f"Error al preparar el hilo de correo: {e}")

    # --- Métodos de Negocio Específicos ---

    def notify_start(self, data):
        self.send_notification(
            subject=f"⚠️ Mantenimiento Iniciado: {data['machine_name']}",
            recipients=[data['production_email']],
            template="maintenance_start",
            **data
        )

    def notify_finish(self, data):
        self.send_notification(
            subject=f"✅ Máquina Operativa: {data['machine_name']}",
            recipients=[data['production_email']],
            template="machine_ready",
            **data
        )

    def notify_delay(self, data):
        # Aquí podrías agregar lógica: Si el retraso es > 4 horas, copiar al Gerente General
        recipients = [data['production_email'], data.get('manager_email')]
        self.send_notification(
            subject=f"🚨 RETRASO CRÍTICO: {data['machine_name']}",
            recipients=recipients,
            template="maintenance_delay",
            **data
        )