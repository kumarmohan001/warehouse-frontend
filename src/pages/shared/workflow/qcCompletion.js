export function qcCompletion(record) {
  const tests = record?.qc?.tests || [];
  const documents = record?.qc?.documents || [];
  const missingDocuments = ['Test Report (COA)', 'Supporting Documents'].filter((kind) => !documents.some((document) => document.kind === kind && document.fileUrl));
  return {
    sampling: Boolean(record?.sampling?.number),
    tests: tests.length > 0,
    uploadQc: missingDocuments.length === 0,
    missingDocuments,
    allTestsPass: tests.length > 0 && tests.every((test) => test.result === 'Pass'),
  };
}
