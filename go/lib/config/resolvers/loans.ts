// Days-before-due thresholds for loan status styling, mirroring dpl-react's
// loan list: warning matches the CMS default for
// expiration_warning_days_before_config (GeneralSettings), danger kicks in
// when the loan is due today or overdue.
// TODO: Resolve the warning threshold from the CMS goConfiguration once it is
// exposed over GraphQL, so libraries can configure it like on the adult site.
const loans = {
  "loans.threshold.warning": 6,
  "loans.threshold.danger": 0,
  // Cicero only allows renewing a loan from one week before the due date
  // ("Du kan først forny et materiale, når der er en uge til
  // afleveringsfristen"). FBS doesn't expose the window per loan — and may
  // even report isRenewable=true without evaluating — so the renew UI is
  // gated on this client-side.
  "loans.renewal-window": 7,
}

export default loans
