export interface SafetyIssue {
  id: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  line?: number;
}

export function analyzeContract(code: string): SafetyIssue[] {
  const issues: SafetyIssue[] = [];
  const lines = code.split('\n');

  // 1. Check for missing tx-sender validation in public functions
  // This is a simplified regex-based check. A real parser would be better.
  const publicFuncRegex = /\(define-public\s*\(([^)]+)\)/g;
  let match;
  
  while ((match = publicFuncRegex.exec(code)) !== null) {
    const funcName = match[1].split(' ')[0];
    const startIndex = match.index;
    
    // Find the closing parenthesis of the function (naive)
    let openCount = 0;
    let endIndex = startIndex;
    let foundStart = false;
    
    for (let i = startIndex; i < code.length; i++) {
        if (code[i] === '(') {
            openCount++;
            foundStart = true;
        }
        else if (code[i] === ')') openCount--;
        
        if (foundStart && openCount === 0) {
            endIndex = i;
            break;
        }
    }

    const funcBody = code.substring(startIndex, endIndex);
    
    // Check if tx-sender is used
    if (funcBody.includes('tx-sender')) {
        // Check if there is an authorization assertion
        const hasAuthCheck = /asserts!\s*\(\s*is-eq\s*tx-sender/.test(funcBody) || 
                             /asserts!\s*\(\s*is-eq\s*contract-caller/.test(funcBody);
        
        if (!hasAuthCheck) {
            issues.push({
                id: `auth-missing-${funcName}`,
                severity: 'high',
                title: `Missing Authorization Check in '${funcName}'`,
                description: `Function '${funcName}' uses 'tx-sender' but does not appear to verify it against a known principal (e.g., owner or arbiter). This could allow unauthorized access.`,
            });
        }
    }
  }

  // 2. Check for unsafe contract calls (ignored return values)
  // Look for (contract-call? ...) that isn't wrapped in (try! ...) or (unwrap! ...) or (match ...)
  // This regex looks for contract-call? that is preceded immediately by an opening parenthesis of a block (like 'begin') 
  // rather than a handling function.
  const unsafeCallRegex = /\(\s*begin\s*[^)]*\(contract-call\?/g;
  if (unsafeCallRegex.test(code)) {
      issues.push({
          id: 'unsafe-contract-call',
          severity: 'medium',
          title: 'Unchecked Contract Call',
          description: 'A contract-call? appears to be used without handling its return value (try!, unwrap!, etc.). This means failures might be ignored.',
      });
  }

  // 3. Check for USDCx SIP-010 Trait Usage
  if (!code.includes('use-trait sip-010-trait')) {
      issues.push({
          id: 'missing-sip-010',
          severity: 'medium',
          title: 'Missing USDCx Trait',
          description: 'The contract does not appear to define the SIP-010 trait for USDCx. Ensure you are using the correct trait definition.',
      });
  }

  return issues;
}
