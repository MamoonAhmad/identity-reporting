
from identity_trace import watch

@watch(name="multiply")
def mul(a, b):
    return 10