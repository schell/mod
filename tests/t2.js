mod({
	name : 't2',
	dependencies : [
		'tests/t2_1.js',
	],
	init : function initT2(mods) {
		console.warn('initializing t2');
		return {
			name : 't2'
		};
	},
	callback : function cbT2(mods) {
		assert.suite = "T2 tests";
		mods.testSeq += '-t2';
	}
});