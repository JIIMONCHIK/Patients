from backend.app.crud.base import CRUDBase
from backend.app.models.medical_record import MedicalRecord
from backend.app.schemas.medical_record import MedicalRecordCreate, MedicalRecordUpdate

class CRUDMedicalRecord(CRUDBase[MedicalRecord, MedicalRecordCreate, MedicalRecordUpdate]):
    pass

medical_record = CRUDMedicalRecord(MedicalRecord)