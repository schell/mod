require({
	name : 'moduleTestOne',
	dependencies : ['moduleTestTwo.js'],
	init : function initModuleOne() {
		return {
			id : 'moduleOne'
		};
	},
	callback : function moduleOneCallback() {
		assert.eq('moduleTestOne' in window, true);
		assert.eq(moduleTestOne.id, 'moduleOne');	
		sequence += 'm1';
	}
});