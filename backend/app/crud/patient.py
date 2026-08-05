from backend.app.crud.base import CRUDBase
from backend.app.models.patient import PatientProfile
from backend.app.schemas.patient import PatientCreate, PatientUpdate

class CRUDPatient(CRUDBase[PatientProfile, PatientCreate, PatientUpdate]):
    pass

patient = CRUDPatient(PatientProfile)