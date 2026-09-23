import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCurrentLoanBalanceToLoans1790155259789 implements MigrationInterface {
  name = 'AddCurrentLoanBalanceToLoans1790155259789';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "loans"
        ADD "currentLoanBalance" numeric(15,2)
      `);

    await queryRunner.query(`
        UPDATE "loans"
        SET "currentLoanBalance" = "amount"
      `);

    await queryRunner.query(`
        ALTER TABLE "loans"
        ALTER COLUMN "currentLoanBalance" SET NOT NULL
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "loans"
        DROP COLUMN "currentLoanBalance"
      `);
  }
}
