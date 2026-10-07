// Week 3: bonus topics + mock interviews. `node week3.js` writes week3-tasks.json and merges into ../site/tasks.json.
const fs = require('fs'), path = require('path');
const yt = q => 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q);
const R = (label, url, note) => ({ label, url, note });
const DOC1 = 'Doc 1 (Bank reconciliation)', DOC2 = 'Doc 2 (Financial reports)';
const MOCK_STEPS = s => [
  '0–5 min · Requirements: functional, non-functional, rough numbers. ' + s[0],
  '5–15 min · API and data model. ' + s[1],
  '15–30 min · High-level diagram, then deep dive. ' + s[2],
  '30–40 min · Scale and failure: what breaks first at 10×? ' + s[3],
  '40–45 min · Trade-offs and what you would do next.',
  'Proof: a photo of your diagram plus the 3 weakest parts of your design.',
];

const days = [
  { date: '2026-10-23', dayLabel: 'Bonus 1', topic: 'Rate limiting', tasks: [
    { kind: 'watch', title: 'Learn rate limiting algorithms', minutes: 25, feeds: DOC2 + ' · §9 Security & Multi-tenancy',
      why: 'One tenant hammering exports should never slow everyone else down. Rate limits are the guard rail.',
      steps: ['Watch the rate limiter video.', 'Read the Stripe post: four kinds of limiters they actually run.', 'Compare token bucket, leaky bucket, fixed window and sliding window in one line each.'],
      resources: [
        R('ByteByteGo: Rate limiting fundamentals', yt('ByteByteGo rate limiter'), 'Video. Token bucket and sliding window, drawn clearly.'),
        R('Stripe: Scaling your API with rate limiters', 'https://stripe.com/blog/rate-limiters', 'Read. Request limiters, concurrency limiters and load shedding.'),
        R('Cloudflare: Counting things, a lot of different things', 'https://blog.cloudflare.com/counting-things-a-lot-of-different-things/', 'Optional. Sliding windows at huge scale.'),
      ] },
    { kind: 'write', title: 'Add per-tenant limits to the reports engine', minutes: 20, feeds: DOC2 + ' · §9',
      steps: ['Token bucket per org for exports: key "rl:{org_id}:exports" in Redis.', 'Return 429 with a Retry-After header when empty.', 'Bigger plans get bigger buckets. Write where that config lives.', 'Note one trade-off: per-instance limits versus a shared Redis counter.'] },
    { kind: 'recall', title: 'Recall: idempotency vs rate limiting', minutes: 5,
      steps: ['In two lines each: what problem does each solve?', 'Which HTTP status codes go with each?'] },
  ]},
  { date: '2026-10-24', dayLabel: 'Mock 1', topic: 'Mock interview: URL shortener', tasks: [
    { kind: 'mock', title: 'Mock interview: design a URL shortener', minutes: 45,
      why: 'A timed, end-to-end design under pressure. The classic first interview question, small enough to finish.',
      steps: MOCK_STEPS(['Try 100M new links a month, 10:1 reads to writes.', 'POST /links, GET /{code}; table links(code, url, owner, created_at).', 'Code generation: base62 counter vs hash; caching hot links.', 'Redirects: 301 vs 302 and what that does to analytics.']),
      resources: [
        R('ByteByteGo: Design a URL shortener', yt('ByteByteGo design URL shortener'), 'Watch AFTER your attempt, then compare.'),
        R('System Design Primer: Pastebin / Bit.ly solution', 'https://github.com/donnemartin/system-design-primer/blob/master/solutions/system_design/pastebin/README.md', 'Reference solution. Read after your attempt.'),
      ] },
    { kind: 'recall', title: 'Self-review against the reference', minutes: 10,
      steps: ['Compare your design with the reference solution.', 'Write the 3 biggest gaps and one thing you did well.'] },
  ]},
  { date: '2026-10-25', dayLabel: 'Catch-up', topic: 'Buffer day', tasks: [
    { kind: 'recall', title: 'Catch up, then a 10-minute recall', minutes: 10,
      why: 'Buffer day. Carried-over quests first, then rest.',
      steps: ['Finish anything carried over.', 'From memory: draw the Doc 1 architecture in 5 minutes.'] },
  ]},
  { date: '2026-10-26', dayLabel: 'Bonus 2', topic: 'Payments and idempotency', tasks: [
    { kind: 'watch', title: 'Learn how real payment systems avoid double charges', minutes: 25, feeds: DOC1 + ' · §8 Failure modes',
      why: 'Money flows are where idempotency, sagas and reconciliation stop being theory.',
      steps: ['Read the Airbnb post on avoiding double payments.', 'Re-read the Stripe idempotency post with fresh eyes.', 'Skim the saga pattern page.'],
      resources: [
        R('Airbnb: Avoiding double payments in a distributed payments system', 'https://medium.com/airbnb-engineering/avoiding-double-payments-in-a-distributed-payments-system-2981f6b070bb', 'Read. Idempotency in production, with failure stories.'),
        R('Stripe: Designing robust APIs with idempotency', 'https://stripe.com/blog/idempotency', 'Re-read. Notice how often retries happen.'),
        R('microservices.io: Saga pattern', 'https://microservices.io/patterns/data/saga.html', 'Skim. Compensating steps instead of distributed transactions.'),
      ] },
    { kind: 'write', title: 'Draw the payment system from memory', minutes: 25,
      steps: ['State machine: created → processing → authorized → captured → settled.', 'Double-entry ledger rows for a ₹100 charge with a ₹3 fee.', 'Outbox → Kafka → ledger and wallet consumers.', 'What happens when the PSP times out? Write the exact steps.'] },
  ]},
  { date: '2026-10-27', dayLabel: 'Bonus 3', topic: 'Event sourcing and CQRS', tasks: [
    { kind: 'watch', title: 'Learn event sourcing and CQRS', minutes: 25, feeds: DOC2 + ' · §6 Data Model',
      why: 'An accounting ledger is already an append-only event log. Seeing it that way explains your snapshot tables.',
      steps: ['Read Fowler on event sourcing.', 'Read Fowler on CQRS, including when NOT to use it.', 'Watch a short explainer if reading feels heavy.'],
      resources: [
        R('Martin Fowler: Event Sourcing', 'https://martinfowler.com/eaaDev/EventSourcing.html', 'Read the first half: events, replays, snapshots.'),
        R('Martin Fowler: CQRS', 'https://martinfowler.com/bliki/CQRS.html', 'Read. Short, with honest warnings.'),
        R('microservices.io: Event sourcing', 'https://microservices.io/patterns/data/event-sourcing.html', 'Skim the diagram and the drawbacks.'),
        R('ByteByteGo: Event sourcing explained', yt('ByteByteGo event sourcing'), 'Video alternative.'),
      ] },
    { kind: 'write', title: 'Map the Books ledger to events and projections', minutes: 20, feeds: DOC2 + ' · §10 Trade-offs',
      steps: ['Events: EntryPosted, EntryReversed, PeriodClosed.', 'Projections: account_period_balances, trial balance.', 'Write one paragraph: is full event sourcing worth it for Books, or just the pattern for the ledger?'] },
    { kind: 'recall', title: 'Recall: payments and the ledger', minutes: 5,
      steps: ['Why do we never update a ledger row?', 'What does reconciliation catch that idempotency does not?'] },
  ]},
  { date: '2026-10-28', dayLabel: 'Bonus 4', topic: 'Observability', tasks: [
    { kind: 'watch', title: 'Learn logs, metrics and traces', minutes: 25, feeds: DOC1 + ' · §8 Scalability & Failure Modes',
      why: 'You cannot fix what you cannot see. Reviewers love a design that says how it will be watched.',
      steps: ['Read the four golden signals section of the SRE book chapter.', 'Read the OpenTelemetry observability primer.', 'Watch the logging/metrics/tracing explainer.'],
      resources: [
        R('Google SRE book: Monitoring Distributed Systems', 'https://sre.google/sre-book/monitoring-distributed-systems/', 'Read "The Four Golden Signals".'),
        R('OpenTelemetry: Observability primer', 'https://opentelemetry.io/docs/concepts/observability-primer/', 'Read. Logs, metrics, traces and how they connect.'),
        R('ByteByteGo: Logging, metrics and tracing', yt('ByteByteGo logging tracing metrics'), 'Video. Short and visual.'),
      ] },
    { kind: 'write', title: 'Add an observability section to Doc 1', minutes: 20, feeds: DOC1 + ' · §8',
      steps: ['Metrics: statements processed, auto-match rate, Kafka consumer lag, DLQ size.', 'Logs: one correlation id from upload to final match.', 'Traces: API → Kafka → parser → matcher.', 'Alerts: lag over 5 minutes, any DLQ message, match rate drop.'] },
  ]},
  { date: '2026-10-29', dayLabel: 'Mock 2', topic: 'Mock interview: notification service', tasks: [
    { kind: 'mock', title: 'Mock interview: design a notification service', minutes: 45,
      why: 'Queues, retries, rate limits and user preferences in one problem. It reuses almost everything you learned.',
      steps: MOCK_STEPS(['Email, SMS and push; 10M notifications a day; spikes at month-end.', 'POST /notifications with an idempotency key; templates; user preferences table.', 'Fan-out through queues per channel; provider adapters.', 'Retries with backoff, DLQ, per-user rate limits, dedupe.']),
      resources: [
        R('ByteByteGo: Design a notification system', yt('ByteByteGo notification system design'), 'Watch AFTER your attempt, then compare.'),
        R('System Design Primer: index of solutions', 'https://github.com/donnemartin/system-design-primer#system-design-interview-questions-with-solutions', 'More practice problems for later.'),
      ] },
    { kind: 'recall', title: 'Self-review: what did you reuse?', minutes: 10,
      steps: ['List every pattern from Weeks 1–2 you used (idempotency, DLQ, cache…).', 'Write the 2 gaps you would fix next time.'] },
  ]},
  { date: '2026-10-30', dayLabel: 'Mock 3', topic: 'Final boss: Books reconciliation', tasks: [
    { kind: 'mock', title: 'Final boss: design bank reconciliation from memory', minutes: 45,
      why: 'Design your own Doc 1 again, from a blank page, in 45 minutes. Then see how far you have come.',
      steps: MOCK_STEPS(['No peeking at Doc 1.', 'Statements, lines, matches; idempotent upload.', 'Async parse and match through Kafka; notify.', 'Big tenants, corrupt files, worker crashes.']),
      resources: [R('Your Doc 1', 'https://excalidraw.com', 'Open GOAL_Q3/doc1-bank-reconciliation.md only after the timer ends.')] },
    { kind: 'action', title: 'Send a wrap-up to your senior', minutes: 10,
      why: 'Close the loop: what you learned, both reviewed docs, and what you want to learn next.',
      steps: ['Write 5 lines: topics covered, docs and their status, one thing you would design differently now.', 'Proof: paste the message or a screenshot.'] },
  ]},
];

const out = [];
for (const d of days) d.tasks.forEach((t, i) => out.push({
  id: 'd' + d.date.slice(5).replace('-', '') + '-' + (i + 1),
  date: d.date, dayLabel: d.dayLabel, topic: d.topic, order: i + 1, kind: t.kind, title: t.title, minutes: t.minutes,
  why: t.why || '', feeds: t.feeds || '', steps: t.steps || [], resources: t.resources || [],
  status: 'todo', proof: null, doneAt: null, spentMin: null,
}));
fs.writeFileSync(path.join(__dirname, 'week3-tasks.json'), JSON.stringify(out, null, 1));
const sitePath = path.join(__dirname, '..', 'site', 'tasks.json');
const site = JSON.parse(fs.readFileSync(sitePath, 'utf8')).filter(t => !out.some(o => o.id === t.id));
fs.writeFileSync(sitePath, JSON.stringify(site.concat(out)));
console.log(out.length + ' week-3 tasks; site total ' + (site.length + out.length));
