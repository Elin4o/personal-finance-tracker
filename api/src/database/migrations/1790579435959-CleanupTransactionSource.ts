import { MigrationInterface, QueryRunner } from 'typeorm';

export class CleanupTransactionSource1790579435959 implements MigrationInterface {
  name = 'CleanupTransactionSource1790579435959';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "source"`);
    await queryRunner.query(`DROP TYPE "public"."transactions_source_enum"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."transactions_source_enum" AS ENUM('MANUAL', 'LOAN')`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD "source" "public"."transactions_source_enum" NOT NULL DEFAULT 'MANUAL'`,
    );
  }
}
