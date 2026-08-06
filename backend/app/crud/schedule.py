from app.crud.base import CRUDBase
from app.models.schedule import ScheduleTemplate
from app.schemas.schedule import ScheduleTemplateCreate, ScheduleTemplateUpdate

class CRUDScheduleTemplate(CRUDBase[ScheduleTemplate, ScheduleTemplateCreate, ScheduleTemplateUpdate]):
    pass

schedule_template = CRUDScheduleTemplate(ScheduleTemplate)