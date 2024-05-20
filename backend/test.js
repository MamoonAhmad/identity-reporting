

function wrapper(func) {
    console.log(func?.name);
    return function() {
        console.log("wrapper")
        func()
    }
} 

@wrapper
function some() {
console.log("some");
}

