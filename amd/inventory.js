define(function () {
    return {
        inventory : [],
        decrement : function (item) {
            var ndx = this.inventory.indexOf(item);
            if (ndx > -1) {
                this.inventory.splice(ndx, 1);
            }
        }
    };
});
