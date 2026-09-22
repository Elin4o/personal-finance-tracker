import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCurrentBalanceToAccounts1790081770864 implements MigrationInterface {
  name = 'AddCurrentBalanceToAccounts1790081770864';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "accounts"
        ADD "currentBalance" numeric(15,2)
      `);

    await queryRunner.query(`
        UPDATE "accounts"
        SET "currentBalance" = "initialBalance"
      `);

    await queryRunner.query(`
        ALTER TABLE "accounts"
        ALTER COLUMN "currentBalance" SET DEFAULT '0'
      `);

    await queryRunner.query(`
        ALTER TABLE "accounts"
        ALTER COLUMN "currentBalance" SET NOT NULL
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP COLUMN "currentBalance"`,
    );
  }
}
