from app.crud.base import CRUDBase
from app.models.patient import PatientProfile
from app.schemas.patient import PatientCreate, PatientUpdate

class CRUDPatient(CRUDBase[PatientProfile, PatientCreate, PatientUpdate]):
    pass

patient = CRUDPatient(PatientProfile)