import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLoanToTransactions1790578800827 implements MigrationInterface {
  name = 'AddLoanToTransactions1790578800827';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "transactions" ADD "loanId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_1781a19ed129d8ecf7ce983ccc9" FOREIGN KEY ("loanId") REFERENCES "loans"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_1781a19ed129d8ecf7ce983ccc9"`,
    );
    await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "loanId"`);
  }
}
