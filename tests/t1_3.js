mod({
	name : 't1_3',
	dependencies : [
		'tests/t1_2.js'
	],
	init : function initT1_3(mods) {
		console.warn('initializing t1_3');
		return {
			name : 't1_3'
		};
	},
	callback : function cbT1_3(mods) {
		assert.eq('t1_3' in mods, true, 't1_3.js was called and module t1_3 is defined');
		mods.testSeq += '-t1_3';
	}
});