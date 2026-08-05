from backend.app.crud.base import CRUDBase
from backend.app.models.doctor import Doctor
from backend.app.schemas.doctor import DoctorCreate, DoctorUpdate

class CRUDDoctor(CRUDBase[Doctor, DoctorCreate, DoctorUpdate]):
    pass

doctor = CRUDDoctor(Doctor)