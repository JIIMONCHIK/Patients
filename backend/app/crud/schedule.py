from backend.app.crud.base import CRUDBase
from backend.app.models.schedule import ScheduleTemplate
from backend.app.schemas.schedule import ScheduleTemplateCreate, ScheduleTemplateUpdate

class CRUDScheduleTemplate(CRUDBase[ScheduleTemplate, ScheduleTemplateCreate, ScheduleTemplateUpdate]):
    pass

schedule_template = CRUDScheduleTemplate(ScheduleTemplate)