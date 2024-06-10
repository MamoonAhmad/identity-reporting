
from identity_trace import watch
count = 0


@watch(name="multiply")
def mul(a, b):
    return a * b


@watch()
def create_ticket_and_item():
    global count
    
    # raise Exception("Something went wrong")
    count = count + 1
    ticket = create_ticket()
    # raise Exception("Something to know about")
    ticket = add_item_to_ticket(ticket, 20)
    if count > 1:
        ticket['price'] = 0
    return ticket
    # return 10

@watch()
def create_ticket():
    some_other()
    return dict(
        customer_name = "Mamoon Ahmed",
        price = 0,
        # another = [{"some": 1}, {"some": 1},{"some": 1},{"some": 1},{"some": 1},{"some": 1},{"some": 1},{"some": 1},{"some": 1},{"some": 1},{"some": 1},{"some": 1},{"some": 1},{"some": 1},{"some": 1},{"some": 1},{"some": 1}],
        items = []
    )

@watch()
def some_other():
    some_other1()


@watch()
def some_other1():
    some_other2()
    # global count
    # if count == 1:
    #     raise Exception("Something is up. This is a very long error and not a short error")
    # count = count + 1
    some_other3()


@watch()
def some_other2():
    some_other3()


@watch()
def some_other3():
    ...


@watch()
def add_item_to_ticket(ticket, item_id):
    some_other()
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