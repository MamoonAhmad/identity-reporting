from rest_framework.viewsets import ModelViewSet
from test_case.serializers import TestCaseSerializer
from test_case.models import TestCase

class TestCaseService(ModelViewSet):

    queryset = TestCase.objects.all()
    serializer_class = TestCaseSerializer
    