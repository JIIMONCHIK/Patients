from app.crud.base import CRUDBase
from app.models.specialization import Specialization
from app.schemas.specialization import SpecializationCreate, SpecializationUpdate

class CRUDSpecialization(CRUDBase[Specialization, SpecializationCreate, SpecializationUpdate]):
    pass

specialization = CRUDSpecialization(Specialization)