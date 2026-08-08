// Mock data for Intervue AI - Responsibility vs. Difficulty Matrix Platform

export const INITIAL_CANDIDATES = [
  {
    id: 'person-1',
    name: 'Person 1',
    role: 'Staff Systems Architect / Tech Lead',
    responsibility: 100,
    maxDifficulty: 10,
    avatarColor: 'from-cyan-500 to-blue-600',
    borderColor: 'border-cyan-500',
    badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    colorHex: '#06b6d4',
    skills: {
      systemDesign: 98,
      problemComplexity: 95,
      autonomousOwnership: 100,
      crisisRecovery: 94,
      leadership: 96,
    },
    bio: 'Proven veteran capable of driving mission-critical core architecture, high-stakes incidents, and end-to-end multi-region systems.',
    evaluatedTasks: 42,
    successRate: 99.2,
  },
  {
    id: 'person-3',
    name: 'Person 3',
    role: 'Senior Software Engineer',
    responsibility: 75,
    maxDifficulty: 8,
    avatarColor: 'from-purple-500 to-indigo-600',
    borderColor: 'border-purple-500',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    colorHex: '#a855f7',
    skills: {
      systemDesign: 82,
      problemComplexity: 85,
      autonomousOwnership: 78,
      crisisRecovery: 72,
      leadership: 75,
    },
    bio: 'Skilled senior developer excelling at complex feature design, API services, and async job queues with moderate oversight.',
    evaluatedTasks: 28,
    successRate: 94.5,
  },
  {
    id: 'person-2',
    name: 'Person 2',
    role: 'Mid-Level Full Stack Developer',
    responsibility: 60,
    maxDifficulty: 6,
    avatarColor: 'from-emerald-500 to-teal-600',
    borderColor: 'border-emerald-500',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    colorHex: '#10b981',
    skills: {
      systemDesign: 65,
      problemComplexity: 68,
      autonomousOwnership: 60,
      crisisRecovery: 58,
      leadership: 55,
    },
    bio: 'Reliable mid-level developer who handles standard product feature work, UI workflows, and component maintenance effectively.',
    evaluatedTasks: 19,
    successRate: 91.0,
  },
];

export const QUESTION_BANK = [
  {
    id: 'q1',
    difficulty: 3,
    levelLabel: 'Level 3 - Beginner / Mid',
    category: 'Data Structures & Logic',
    title: 'Implement an LRU Cache with O(1) Access & Eviction',
    scenario: 'Design a Data Structure for an LRU (Least Recently Used) cache with fixed capacity. Implement get(key) and put(key, value) in O(1) time complexity.',
    hints: ['Consider combining a doubly linked list with a hash map.', 'Update node pointers when accessing existing keys.'],
    sampleSolution: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
  }
  get(key) {
    if (!this.map.has(key)) return -1;
    const val = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, val);
    return val;
  }
  put(key, value) {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.capacity) {
      const oldestKey = this.map.keys().next().value;
      this.map.delete(oldestKey);
    }
  }
}`
  },
  {
    id: 'q2',
    difficulty: 6,
    levelLabel: 'Level 6 - Mid / Senior',
    category: 'System Design & Async Operations',
    title: 'Design a Distributed Rate Limiter with Sliding Window',
    scenario: 'Your system receives 50,000 requests/sec. Design a rate limiting middleware using Redis that enforces 100 requests per minute per IP using sliding window logs or token buckets.',
    hints: ['Redis ZADD and ZREMRANGEBYSCORE can keep sliding timestamp logs.', 'Watch out for race conditions; use Lua scripts or Redis transactions.'],
    sampleSolution: `async function isRateLimited(userId, limit = 100, windowSec = 60) {
  const now = Date.now();
  const windowStart = now - windowSec * 1000;
  const key = \`rate_limit:\${userId}\`;

  const pipeline = redis.pipeline();
  pipeline.zremrangebyscore(key, 0, windowStart);
  pipeline.zcard(key);
  pipeline.zadd(key, now, \`\${now}-\${Math.random()}\`);
  pipeline.expire(key, windowSec);

  const results = await pipeline.exec();
  const reqCount = results[1][1];
  return reqCount >= limit;
}`
  },
  {
    id: 'q3',
    difficulty: 9,
    levelLabel: 'Level 9 - Senior / Staff Architect',
    category: 'High Availability & Failover Architecture',
    title: 'Zero-Downtime Multi-Region Database Migration & Split Brain Prevention',
    scenario: 'You are migrating a 50TB PostgreSQL database from AWS US-East to EU-Central live with zero downtime. Formulate the architecture plan, replication mechanism, conflict resolution strategy, and rollback strategy.',
    hints: ['Use Logical Replication, dual writing with feature flags, CDC (Debezium/Kafka), and quorum consensus for cutover.', 'Address sequence generation and idempotency.'],
    sampleSolution: `Architecture Strategy:
1. Dual-Write via Kafka Event Bus with CDC (Debezium) capturing WAL logs.
2. Idempotent Consumer updates EU cluster with logical replication gap checking.
3. Feature-flagged Read Traffic routing: 0% -> 10% -> 50% -> 100% to EU.
4. Cutover Quorum: Pause writes for 500ms to allow CDC backlog drain, swap DB connection string, resume writes.`
  }
];

export const SAMPLE_TASKS = [
  {
    id: 'task-101',
    title: 'Implement Global Multi-Region Failover Controller',
    difficulty: 9,
    risk: 'Critical',
    estimatedHours: 40,
    requiredResponsibility: 90,
    tags: ['Distributed Systems', 'Go', 'Kubernetes', 'High Stakes'],
  },
  {
    id: 'task-102',
    title: 'Refactor Payment Webhook Retry Queue & Dead-Letter Exchange',
    difficulty: 7,
    risk: 'High',
    estimatedHours: 24,
    requiredResponsibility: 70,
    tags: ['RabbitMQ', 'Node.js', 'Resilience'],
  },
  {
    id: 'task-103',
    title: 'Build Candidate Assessment Filter Modal UI & Analytics Charts',
    difficulty: 5,
    risk: 'Low',
    estimatedHours: 12,
    requiredResponsibility: 50,
    tags: ['React', 'Tailwind', 'Frontend'],
  },
  {
    id: 'task-104',
    title: 'Optimize Database Query Indexes for User Audit Logs',
    difficulty: 6,
    risk: 'Medium',
    estimatedHours: 16,
    requiredResponsibility: 60,
    tags: ['PostgreSQL', 'SQL Optimization'],
  },
];
