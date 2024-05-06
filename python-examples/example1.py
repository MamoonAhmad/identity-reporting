
from identity_trace import watch

@watch(name="multiply")
def mul(a, b):
    return a * b


@watch()
def create_ticket_and_item():
    ticket = create_ticket()
    add_item_to_ticket(ticket, 20)
    return ticket

@watch()
def create_ticket():

    return dict(
        customer_name = "Mamoon Ahmed",
        price = 0,
        
        items = []
    )


@watch()
def add_item_to_ticket(ticket, item_id):

    if item_id == 20:
        ticket["items"].append(dict(
            name = "Item 1",
            price = 100
        ))
        ticket["price"] = ticket["price"] + 100
    else:
        raise Exception("Invalid item id.")
    
    return ticket


@watch()
def some_func(add, mul=None):
    return str(add) + str(mul)