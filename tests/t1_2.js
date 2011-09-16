mod({
	name : 't1_2',
	dependencies : [
	],
	init : function initT1_2(mods) {
		console.warn('initializing t1_2');
		return {
			name : 't1_2'
		};
	},
	callback : function cbT1_2(mods) {
		mods.testSeq = '';
		assert.eq('t1_2' in mods, true, 't1_2.js was called and module t1_2 is defined');
		mods.testSeq += '-t1_2';
	}
});