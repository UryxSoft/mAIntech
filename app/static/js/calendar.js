// app/static/js/calendar.js

class MaintenanceCalendar {
    constructor() {
        this.calendar = null;
        this.init();
    }

    init() {
        const Calendar = tui.Calendar;
        this.calendar = new Calendar('#calendar', {
            defaultView: 'month',
            useCreationPopup: false,
            useDetailPopup: true,
            calendars: [
                {
                    id: 'preventive',
                    name: 'Mantenimiento Preventivo',
                    backgroundColor: '#3498db',
                    borderColor: '#3498db',
                },
                {
                    id: 'corrective',
                    name: 'Mantenimiento Correctivo',
                    backgroundColor: '#e74c3c',
                    borderColor: '#e74c3c',
                }
            ]
        });

        this.initEventListeners();
        this.loadEvents();
    }

    initEventListeners() {
        document.getElementById('cal-prev').addEventListener('click', () => this.calendar.prev());
        document.getElementById('cal-next').addEventListener('click', () => this.calendar.next());
    }

    async loadEvents() {
        try {
            const response = await fetch('/maintenance/api/calendar');
            if (!response.ok) throw new Error('Error al cargar los eventos del calendario.');

            const events = await response.json();
            this.calendar.createEvents(events);
        } catch (error) {
            console.error(error);
            // Idealmente, usar un toast de uiManager si está disponible
            alert(error.message);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('calendar')) {
        new MaintenanceCalendar();
    }
});
