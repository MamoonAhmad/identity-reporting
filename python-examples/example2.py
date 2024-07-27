



def something_new():
    conf = dict()
    another_thing(conf)
    Some(some=20)
    return conf



def another_thing(conf):

    conf["price"] = 10


class Some:


    def __init__(self, some = None) -> None:
        self.some = some