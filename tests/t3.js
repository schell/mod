mod({
	name : 't3',
	dependencies : [
		'tests/t2.js',
	],
	init : function initT3(t2) {
		console.warn('initializing t3');
        assert.eq(t2.name, 't2', 't2 is passed to t3.');
		return {
			name : 't3'
		};
	}
});