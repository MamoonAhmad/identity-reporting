from rest_framework.routers import SimpleRouter
from .test_case import TestCaseService



router = SimpleRouter(trailing_slash=False)
router.register('test_case', TestCaseService)
urls = router.urls

