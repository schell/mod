mod({
	name : 't2_1',
	dependencies : [
	],
	init : function initT2_1(mods) {
		console.warn('initializing t2_1');
		return {
			name : 't2_1'
		};
	},
	callback : function cbT2_1(mods) {
		mods.testSeq += '-t2_1';
	}
});