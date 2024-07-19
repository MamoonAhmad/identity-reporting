# from identity_trace import initialize
from identity_trace.runner import initialize
import sys



# print("Running test")
# res = execute_run_file()


# sys.exit(0)



# import socketio

# # Create a Socket.IO client
# sio = socketio.Client()

# # Define event handlers
# @sio.event
# def connect():
#     print("I'm connected!")

# @sio.event
# def connect_error(data):
#     print("The connection failed!")

# @sio.event
# def disconnect():
#     print("I'm disconnected!")
#     sio.shutdown()
    

# @sio.event
# def response(data):
#     print("Received response:", data)

# @sio.event
# def run_function(request_id, function_config):
    
#     try: 
#         function_trace_instance = run_function_from_run_file(function_config)
#         sio.emit(
#             "message",
#             dict(
#                 action = "run_function_result_trace",
#                 payload = dict(
#                     requestID = request_id,
#                     trace = function_trace_instance.serialize()
#                 )
#             )
#         )
#     except Exception as exception:
#         sio.emit(
#             "message",
#             dict(
#                 action = "run_function_result_trace",
#                 payload = dict(
#                     requestID = request_id,
#                     error = str(exception)
#                 )
#             )
#         )
    
    


# # Connect to the Socket.IO server
# sio.connect('http://localhost:8002')

# # Send a message to the server
# sio.emit('message', dict(
#     action = "client_app_connect",
#     payload = True
# ))

# # Wait for events
# sio.wait()


initialize()