from backend.app.crud.base import CRUDBase
from backend.app.models.specialization import Specialization
from backend.app.schemas.specialization import SpecializationCreate, SpecializationUpdate

class CRUDSpecialization(CRUDBase[Specialization, SpecializationCreate, SpecializationUpdate]):
    pass

specialization = CRUDSpecialization(Specialization)