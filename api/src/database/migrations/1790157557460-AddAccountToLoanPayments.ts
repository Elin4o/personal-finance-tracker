import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAccountToLoanPayments1790157557460 implements MigrationInterface {
  name = 'AddAccountToLoanPayments1790157557460';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "loan_payments"
      ADD "accountId" uuid
    `);

    await queryRunner.query(`
      ALTER TABLE "loan_payments"
      ALTER COLUMN "accountId" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "loan_payments"
      ADD CONSTRAINT "FK_0e40bf9452febce435ee47191a4"
      FOREIGN KEY ("accountId")
      REFERENCES "accounts"("id")
      ON DELETE RESTRICT
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "loan_payments" DROP CONSTRAINT "FK_0e40bf9452febce435ee47191a4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loan_payments" DROP COLUMN "accountId"`,
    );
  }
}
