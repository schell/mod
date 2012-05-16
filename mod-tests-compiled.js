(function initModCompilation(window) {
    var modules = {};/// testSeq from tests/testSeq.js
    modules.testSeq = {seq:""};
/// t2_1 from tests/t2_1.js
    modules.t2_1 = (function initT2_1(testSeq) {
		console.warn('initializing t2_1');
        testSeq.seq += '-t2_1';
		return {
			name : 't2_1'
		};
	})(modules.testSeq);
/// t2 from tests/t2.js
    modules.t2 = (function initT2(t2_1, testSeq) {
        console.warn('initializing t2');

        assert.suite = "T2 tests";
        assert.eq(t2_1.name, 't2_1', 't2_1 is loaded.');
        testSeq.seq += '-t2';
        
        return {
            name : 't2'
        };
    })(modules.t2_1,modules.testSeq);
/// t3 from tests/t3.js
    modules.t3 = (function initT3(t2) {
		console.warn('initializing t3');
        assert.eq(t2.name, 't2', 't2 is passed to t3.');
		return {
			name : 't3'
		};
	})(modules.t2);
/// parallel from tests/parallel.js
    modules.parallel = (function initParallel(t3, t2) {
		console.warn('initializing parallel');
		assert.suite = "Parallel tests";
		assert.eq(t3.name, 't3', 't3 is passed to parallel.');
		assert.eq(t2.name, 't2', 't2 is passed to parallel.');
	    
    	return {
			name : 'parallel'
		};
    })(modules.t3,modules.t2);
/// t1_2 from tests/t1_2.js
    modules.t1_2 = (function initT1_2(testSeq) {
		console.warn('initializing t1_2');

		testSeq.seq += '-t1_2';
	    
    	return {
			name : 't1_2'
		};
	})(modules.testSeq);
/// t1_3 from tests/t1_3.js
    modules.t1_3 = (function initT1_3(testSeq, t1_2) {
		console.warn('initializing t1_3');
        
        assert.eq(t1_2.name, 't1_2', 't1_2 is loaded.');
		testSeq.seq += '-t1_3';
        
		return {
			name : 't1_3'
		};
	})(modules.testSeq,modules.t1_2);
/// t1_1 from tests/t1_1.js
    modules.t1_1 = (function initT1_1(testSeq, t1_3, t1_2) {
		console.warn('initializing t1_1');
        
		testSeq.seq += '-t1_1';
		
        return {
			name : 't1_1'
		};
	})(modules.testSeq,modules.t1_3,modules.t1_2);
/// t1 from tests/t1.js
    modules.t1 = (function initT1(testSeq, t1_1) {
		console.warn('initializing t1');
		
        assert.suite = "T1 tests";
		testSeq.seq += '-t1';
		assert.eq(testSeq.seq, '-t2_1-t2-t1_2-t1_3-t1_1-t1', 'modules init\'d in correct order');
        
		return {
			name : 't1'
		};
	})(modules.testSeq,modules.t1_1);
/// ExpansionTest from URLExpansion::ExpansionTest.js
    modules.ExpansionTest = (function initE(m) {     
        /** * *
        * This is empty because to load this, is to pass.
        * * **/
        return 0xBEEF;
    })();
/// DoubleExpansion from URLExpansion::Deepest::DoubleExpansion.js
    modules.DoubleExpansion = (function initE(m) {     
        /** * *
        * This is empty because to load this, is to pass.
        * * **/
        return 0xFACE;
    })();
/// main from main
    modules.main = (function initMain(parallel, t1, expansionTest, double) {
                        var modules = mod.modules;
                        // Is module tests
                        assert.eq(mod.isModule({
                            name : 'ismod'
                        }), false, 'Object with only name is not a module');
                        assert.eq(mod.isModule({
                            name : 'ismod',
                            dependencies : []
                        }), false, 'Object without init function is not a module');
                        assert.eq(mod.isModule({
                            name : 'ismod',
                            init : function () {}
                        }), true, 'Object with only name and init function is a module');
                        // URL expansion tests...
                        assert.eq(expansionTest, 0xBEEF, 'Can expand paths by key.');
                        assert.eq(double, 0xFACE, 'Can expand paths by multiple keys.');
                        // Standard JS test...
                        assert.eq('go' in window, true, 'Can load external, non-module source files.');
                        return {};
                    })(modules.parallel,modules.t1,modules.ExpansionTest,modules.DoubleExpansion);
    return modules;
}(window));