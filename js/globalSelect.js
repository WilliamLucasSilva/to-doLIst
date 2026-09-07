export const globalSelect = {
    selectedExclude: [null, null],
    select: ['/', '/'],
    attSelect: (newPath) => {
        globalSelect.select[1] = globalSelect.select[0]
        globalSelect.select[0] = newPath
    },
}