from app.crud.base import CRUDBase
from app.models.slot import AppointmentSlot
from app.schemas.slot import AppointmentSlotCreate, AppointmentSlotUpdate

class CRUDAppointmentSlot(CRUDBase[AppointmentSlot, AppointmentSlotCreate, AppointmentSlotUpdate]):
    pass

appointment_slot = CRUDAppointmentSlot(AppointmentSlot)