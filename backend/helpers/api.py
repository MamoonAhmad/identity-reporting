
from rest_framework.views import APIView
from rest_framework.request import Request
from django.http import JsonResponse


class APIEndpoint(APIView):


    def error_response(self, error_message = None):

        return JsonResponse(success=False, error_message=error_message)
    

    def get_object(self, pk = None):
        if pk:
            try:
                return self.get_queryset().get(pk=pk)
            except Exception as e:
                return self.error_response(error_message=str(e))


    def get(self, request, pk=None, *args, **kwargs):
        
        request: Request = request

        data = dict()
        for k,v in request.query_params.items():
            data[k] = v
        

        

    

         
    


    