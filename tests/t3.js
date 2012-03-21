mod({
	name : 't3',
	dependencies : [
		'tests/t2.js',
	],
	init : function initT3(mods) {
		console.warn('initializing t3');
		return {
			name : 't3'
		};
	},
	callback : function cbT3(mods) {
		assert.suite = "T3 tests";
		assert.eq('t3' in mods, true, 't3.js was called and module t3 is defined');
		mods.testSeq += '-t3';
	}
});