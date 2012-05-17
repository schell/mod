define(function () {
    var _cart = [];
    return {
        add : function (item) {
            _cart.push(item);
        }
    };
});