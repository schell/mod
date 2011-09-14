require({
	name : 'moduleTestThree',
	dependencies : [
		'initFirst.js'
	], // circular dependencies, but should get init'd before this
	init : function initModuleThree() {
		return {
			id : 'moduleThree'
		};
	},
	callback : function moduleThreeCallback() {
		assert.eq('moduleTestThree' in window, true);
		assert.eq(moduleTestThree.id, 'moduleThree');
		sequence += 'm3';
	}
});