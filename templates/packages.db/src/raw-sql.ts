// -----------------------------------------------------------------------------
// Interfaces

/*
Example:

export interface LeaseDueJobsInput {
  nowMs: bigint;
  workerId: string;
  leaseUntilMs: bigint;
  limit: number;
  updatedAtTsSec: bigint;
}
*/

// -----------------------------------------------------------------------------
// Methods

/*
Example:

export const leaseDueJobs = async (db: DbClient, input: LeaseDueJobsInput): Promise<QueueJobRow[]> =>
  db.$queryRaw<QueueJobRow[]>(Prisma.sql`
    WITH due_jobs AS (
      SELECT job_id
      FROM queue_jobs
      WHERE status IN ('pending', 'failed_retryable')
        AND run_at_ms <= ${input.nowMs}
      ORDER BY run_at_ms ASC, job_id ASC
      LIMIT ${input.limit}
      FOR UPDATE SKIP LOCKED
    )
    UPDATE queue_jobs
    SET
      status = 'leased',
      locked_by = ${input.workerId},
      locked_until_ms = ${input.leaseUntilMs},
      attempt_count = attempt_count + 1,
      last_error = NULL,
      updated_at_ts_sec = ${input.updatedAtTsSec}
    FROM due_jobs
    WHERE queue_jobs.job_id = due_jobs.job_id
    RETURNING
      queue_jobs.job_id AS "jobId",
      queue_jobs.job_type AS "jobType",
      queue_jobs.status::text AS "status",
      queue_jobs.market_id AS "marketId",
      queue_jobs.entity_type AS "entityType",
      queue_jobs.entity_id AS "entityId",
      queue_jobs.run_at_ms AS "runAtMs",
      queue_jobs.attempt_count AS "attemptCount",
      queue_jobs.locked_by AS "lockedBy",
      queue_jobs.locked_until_ms AS "lockedUntilMs",
      queue_jobs.idempotency_key AS "idempotencyKey",
      queue_jobs.payload AS "payload",
      queue_jobs.last_error AS "lastError",
      queue_jobs.created_at_ts_sec AS "createdAtTsSec",
      queue_jobs.updated_at_ts_sec AS "updatedAtTsSec"
  `);
*/

export {};
