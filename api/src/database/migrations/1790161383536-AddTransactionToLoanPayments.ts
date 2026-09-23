import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTransactionToLoanPayments1790161383536 implements MigrationInterface {
  name = 'AddTransactionToLoanPayments1790161383536';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "loan_payments" ADD "transactionId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "loan_payments" ADD CONSTRAINT "UQ_24d065e2e1b09870302912e2747" UNIQUE ("transactionId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "loan_payments" ADD CONSTRAINT "FK_24d065e2e1b09870302912e2747" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "loan_payments" DROP CONSTRAINT "FK_24d065e2e1b09870302912e2747"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loan_payments" DROP CONSTRAINT "UQ_24d065e2e1b09870302912e2747"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loan_payments" DROP COLUMN "transactionId"`,
    );
  }
}
