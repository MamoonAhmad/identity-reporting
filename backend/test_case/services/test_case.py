from rest_framework.viewsets import ModelViewSet
from test_case.serializers import TestCaseSerializer
from test_case.models import TestCase
from identity_python import identify, add_event_listener, EVENT_TYPES
import json
import jsonpickle
import datetime

class DatetimeHandler(jsonpickle.handlers.BaseHandler):
    def flatten(self, obj, data):
        return str(obj)

jsonpickle.handlers.registry.register(datetime.datetime, DatetimeHandler)

def on_execution_end(event_data):
    executed_function: list = event_data['executed_functions']
    executed_function[0]

    data = []
    for e in executed_function:
        data.append(dict(
            name = e.name,
            description = e.description,
            executed_successfully = e.executed_successfully,
            execution_id = str(e.execution_id),
            id = str(e.id),
            exception = str(e.exception) if e.exception else None,
            output_data = e.output_data,
            input_data = e.input_data,
            parent_id = e.parent_id,
            logs = json.loads(jsonpickle.encode(e.logger.logs, use_decimal=True))
        ))
    
    print(json.dumps(data))

add_event_listener(event_type=EVENT_TYPES.EXECUTION_END, callback=on_execution_end)


class TestCaseService(ModelViewSet):

    queryset = TestCase.objects.all()
    serializer_class = TestCaseSerializer
    

    def get_queryset(self):
        some_function()
        return super().get_queryset()


@identify(description = "Some Function To Test Some Things")
def some_function(logger = None):

    logger.info(message = "Some things to inform")

    logger.create_object(message= "Line Item Created", object = dict(id = 1))

    some_child_function()


@identify(description = "Some Child Function To Test Some Things")
def some_child_function(logger = None):

    logger.update_object(message= "Line Item updated", object = dict(id = 1))