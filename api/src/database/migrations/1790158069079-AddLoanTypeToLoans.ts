import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLoanTypeToLoans1790158069079 implements MigrationInterface {
  name = 'AddLoanTypeToLoans1790158069079';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."loans_type_enum" AS ENUM('BORROWED', 'LENT')`,
    );
    await queryRunner.query(
      `ALTER TABLE "loans" ADD "type" "public"."loans_type_enum" NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "loans" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "public"."loans_type_enum"`);
  }
}
