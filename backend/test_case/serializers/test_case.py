from rest_framework.serializers import ModelSerializer
from test_case.models import TestCase



class TestCaseSerializer(ModelSerializer):

    class Meta:
        model = TestCase
        fields = ['id', 'name', 'description', 'config']
    