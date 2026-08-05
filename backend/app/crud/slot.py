from backend.app.crud.base import CRUDBase
from backend.app.models.slot import AppointmentSlot
from backend.app.schemas.slot import AppointmentSlotCreate, AppointmentSlotUpdate

class CRUDAppointmentSlot(CRUDBase[AppointmentSlot, AppointmentSlotCreate, AppointmentSlotUpdate]):
    pass

appointment_slot = CRUDAppointmentSlot(AppointmentSlot)