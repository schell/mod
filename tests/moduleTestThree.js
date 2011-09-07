require({
	name : 'moduleTestThree',
	dependencies : ['moduleTestOne.js'], // circular
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