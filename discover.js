// Returns each test by name pattern so autosplit distributes them across tasks.
// This gives HyperExecute 3 work items — enough to fill all tasks on win & linux.
var tests = [
  'tests/testmu.spec.ts --grep "Scenario 1"',
  'tests/testmu.spec.ts --grep "Scenario 2"',
  'tests/testmu.spec.ts --grep "Scenario 3"'
];
console.log(tests.join('\n'));