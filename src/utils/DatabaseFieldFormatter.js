
export const formatter = {
    formatColumnType(column) {
        const ignoreLengthTypes = ['timestamp', 'json', 'bool']
        // 长度
        if (column.decimalDigits == null || column.decimalDigits == 0 || ignoreLengthTypes.some(type => type == column.type.toLowerCase())) {
            return column.type + '('+column.size+')' 
        } else {
            return column.type + '('+column.size+', '+column.decimalDigits+')'
        }
    },

    formatColumnName(column, withComment) {
        if (withComment) {
            if (column.comment && column.comment != '') {
                return column.name + ' /* ' + column.comment +' */'
            }
        } 
        return column.name
    }
}