mod({
	name : 't1_1',
	dependencies : [
		'tests/t1_3.js',
		'tests/t1_2.js'
	],
	init : function initT1_1(mods) {
		console.warn('initializing t1_1');
		return {
			name : 't1_1'
		};
	},
	callback : function cbT1_1(mods) {
		assert.eq('testSeq' in mods, true, 'testSeq is defined in modules');
		assert.eq('t1_1' in mods, true, 't1_1.js was called and module t1_1 is defined');
		mods.testSeq += '-t1_1';
	}
});