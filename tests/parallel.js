mod({
	name : 'parallel',
	dependencies : [
		't3.js',
		't2.js',
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
		if (mod.scripts) { // because this might be compiled, in which case mod might be reset
			var t2_1ndx = mod.scripts.indexOf('t2_1.js');
			var t2_ndx = mod.scripts.indexOf('t2.js');
			var t3_ndx = mod.scripts.indexOf('t3.js');
			assert.eq(t2_1ndx, 0, 't2_1.js is listed in scripts first');
			assert.eq(t2_ndx, 1, 't2.js is listed in scripts second');
			assert.eq(t3_ndx, 2, 't3.js is listed in scripts third');
		}
	}
});