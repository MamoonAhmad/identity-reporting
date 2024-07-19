


export const matchWithOperator = (object, propName, filterValue, overrides = {}) => {
    if (overrides?.[propName]) {
        return overrides?.[propName](object)
    }
    if (filterValue?.contains) {
        return !!object?.[propName]?.toString()?.includes(filterValue?.contains)
    }
    if (filterValue?.eq) {
        return object?.[propName]?.toString() === filterValue?.eq?.toString()
    }
}