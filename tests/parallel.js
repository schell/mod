mod({
	name : 'parallel',
	dependencies : [
		'tests/t3.js',
		'tests/t2.js',
	],
	init : function initParallel(mods) {
		console.warn('initializing parallel');
		return {
			name : 'parallel'
		};
	},
	callback : function cbParallel(mods) {
		assert.suite = "Parallel tests";
		assert.eq('t2' in mods, true, 't2.js was called and module t2 is defined');
		assert.eq('t3' in mods, true, 't3.js was called and module t3 is defined');
	}
});