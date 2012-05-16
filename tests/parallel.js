mod({
	name : 'parallel',
	dependencies : [
		'tests/t3.js',
		'tests/t2.js',
	],
	init : function initParallel(t3, t2) {
		console.warn('initializing parallel');
		assert.suite = "Parallel tests";
		assert.eq(t3.name, 't3', 't3 is passed to parallel.');
		assert.eq(t2.name, 't2', 't2 is passed to parallel.');
	    
    	return {
			name : 'parallel'
		};
	}
});