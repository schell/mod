mod({
	name : 't1',
	dependencies : [
		't1_1.js'
	],
	init : function initT1(mods) {
		console.warn('initializing t1');
		return {
			name : 't1'
		};
	},
	callback : function cbT1(mods) {
		assert.suite = "T1 tests";
		assert.eq('t1' in mods, true, 't1.js was called and module t1 is defined');
		mods.testSeq += '-t1';
		assert.eq(mods.testSeq, '-t1_2-t1_3-t1_1-t1', 'modules initd in correct order (t1)');
	}
});