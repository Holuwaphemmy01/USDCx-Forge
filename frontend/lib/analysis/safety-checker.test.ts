import { describe, it, expect } from 'vitest';
import { analyzeContract } from './safety-checker';

const SAFE_WRAPPED = `
(use-trait sip-010-trait .sip-010-trait.sip-010-trait)
(define-data-var owner principal 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM)
(define-public (safe-transfer (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender (var-get owner)) (err u100))
    (try! (ft-transfer? amount tx-sender recipient))
    (ok true)
  )
)`;

const UNSAFE_DIRECT = `
(use-trait sip-010-trait .sip-010-trait.sip-010-trait)
(define-public (unsafe-transfer (amount uint) (recipient principal))
  (begin
    (ft-transfer? amount tx-sender recipient)
    (ok true)
  )
)`;

const UNSAFE_BOUND_NO_UNWRAP = `
(use-trait sip-010-trait .sip-010-trait.sip-010-trait)
(define-public (unsafe-bound (amount uint) (recipient principal))
  (let ((res (ft-transfer? amount tx-sender recipient)))
    (var-set owner tx-sender)
    (ok res)
  )
)`;

const UNCHECKED_THEN_STATE = `
(use-trait sip-010-trait .sip-010-trait.sip-010-trait)
(define-public (unchecked-then-state (amount uint) (recipient principal))
  (begin
    (ft-transfer? amount tx-sender recipient)
    (var-set owner recipient)
    (ok true)
  )
)`;

describe('Safety Checker deep transfer checks', () => {
  it('does not flag wrapped transfer calls', () => {
    const issues = analyzeContract(SAFE_WRAPPED);
    const unchecked = issues.filter(i => i.title === 'Unchecked Transfer Result');
    expect(unchecked.length).toBe(0);
  });

  it('flags direct unsafe transfer calls as medium severity', () => {
    const issues = analyzeContract(UNSAFE_DIRECT);
    const unchecked = issues.filter(i => i.title === 'Unchecked Transfer Result');
    expect(unchecked.length).toBeGreaterThan(0);
    expect(unchecked.some(i => i.severity === 'medium')).toBe(true);
  });

  it('flags bound transfer without unwrap', () => {
    const issues = analyzeContract(UNSAFE_BOUND_NO_UNWRAP);
    const bound = issues.filter(i => i.id.includes('deep-unchecked-bound'));
    expect(bound.length).toBeGreaterThan(0);
  });

  it('escalates severity to high when state changes follow unchecked call', () => {
    const issues = analyzeContract(UNCHECKED_THEN_STATE);
    const highUnchecked = issues.filter(
      i => i.title === 'Unchecked Transfer Result' && i.severity === 'high'
    );
    expect(highUnchecked.length).toBeGreaterThan(0);
  });
});
