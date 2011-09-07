require({
	name : 'moduleTestTwo',
	dependencies : ['moduleTestThree.js'],
	init : function initModuleTwo() {
		return {
			id : 'moduleTwo'
		};
	},
	callback : function moduleTwoCallback() {
		assert.eq('moduleTestTwo' in window, true);
		assert.eq(moduleTestTwo.id, 'moduleTwo');
		sequence += 'm2';
	}
});