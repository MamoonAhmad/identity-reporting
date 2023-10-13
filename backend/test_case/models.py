from django.db import models
import uuid

# Create your models here.

class BaseModel(models.Model):
    class Meta:
        abstract = True

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

class TestCase(BaseModel):
    
    name = models.TextField()
    description = models.TextField()
    functions = models.JSONField(null=True)