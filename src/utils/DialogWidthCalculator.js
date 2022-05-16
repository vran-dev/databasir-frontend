export const responsive = (map) => {
    const width = window.innerWidth
    if (width >= 1920) {
        return  (map.xl?map.xl: null)
    } else if (width >= 1200) {
        return  (map.lg?map.lg: map.xl?map.xl: null)

    } else if (width >= 992) {
        return  (map.md? map.md: map.lg?map.lg: map.xl?map.xl: null)

    } else if (width >= 768) {
        return map.sm ? map.sm : (map.md? map.md: map.lg?map.lg: map.xl?map.xl: null)
    } else {
        return map.xs ? map.xs :(map.sm ? map.sm : (map.md? map.md: map.lg?map.lg: map.xl?map.xl: null))
    }
}


export const dialogPercentWidth = () => {
    return responsive({
        xl: "36%",
        lg: "42%",
        md: "60%",
        sm: "80%",
        xs: "90%"
    })
}