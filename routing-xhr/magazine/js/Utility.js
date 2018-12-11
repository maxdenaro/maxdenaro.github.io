"use strict";

const random = (lower = 0, upper = 1) =>
    lower + Math.floor(Math.random() * (upper - lower + 1))

function getHOCComponentName(Component) {
    return Component.displayName || Component.name || 'Component';
}

function getItemsWithIds(array) {
    if (!array) {
        return array;
    }
    const arrWithIds = array.map((element) => ({
        guid: uuid(),
        value: element
    }))
    return arrWithIds;
}

function getItemById(array, id) {
    if (!array) {
        return array;
    }
    if (id) {
        return array.find(a => a.value.id === parseInt(id));
    } else {
        return array[0];
    }
}

function isStateless(Component) {
    return !Component.prototype.render;
}