import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1790022812521 implements MigrationInterface {
  name = 'InitialSchema1790022812521';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."transactions_type_enum" AS ENUM('INCOME', 'EXPENSE', 'TRANSFER')`,
    );
    await queryRunner.query(
      `CREATE TABLE "transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."transactions_type_enum" NOT NULL, "amount" numeric(15,2) NOT NULL, "currency" character varying(3) NOT NULL, "date" TIMESTAMP WITH TIME ZONE NOT NULL, "description" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid NOT NULL, "accountId" uuid NOT NULL, "transferToAccountId" uuid, "categoryId" uuid, CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."categories_type_enum" AS ENUM('INCOME', 'EXPENSE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "type" "public"."categories_type_enum" NOT NULL, "isArchived" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid NOT NULL, CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "loan_payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "amount" numeric(15,2) NOT NULL, "currency" character varying(3) NOT NULL, "date" TIMESTAMP WITH TIME ZONE NOT NULL, "note" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "loanId" uuid NOT NULL, CONSTRAINT "PK_db75e38243b5f2cb9e728da4d0f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "loans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "personName" character varying NOT NULL, "amount" numeric(15,2) NOT NULL, "currency" character varying(3) NOT NULL, "date" TIMESTAMP WITH TIME ZONE NOT NULL, "dueDate" TIMESTAMP WITH TIME ZONE, "description" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid NOT NULL, CONSTRAINT "PK_5c6942c1e13e4de135c5203ee61" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "savings_goals" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "targetAmount" numeric(15,2) NOT NULL, "currency" character varying(3) NOT NULL, "targetDate" TIMESTAMP WITH TIME ZONE, "description" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid NOT NULL, "accountId" uuid, CONSTRAINT "PK_4f1e133521cfbf2b4252bd8f09d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "notification_settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "emailEnabled" boolean NOT NULL DEFAULT true, "pushEnabled" boolean NOT NULL DEFAULT false, "loanRemindersEnabled" boolean NOT NULL DEFAULT true, "savingsGoalRemindersEnabled" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid NOT NULL, CONSTRAINT "REL_5a8ffc3b89343043c9440d631e" UNIQUE ("userId"), CONSTRAINT "PK_d131abd7996c475ef768d4559ba" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "passwordHash" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."accounts_type_enum" AS ENUM('CASH', 'BANK', 'CARD', 'SAVINGS', 'OTHER')`,
    );
    await queryRunner.query(
      `CREATE TABLE "accounts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "type" "public"."accounts_type_enum" NOT NULL, "currency" character varying(3) NOT NULL, "initialBalance" numeric(15,2) NOT NULL, "isArchived" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid NOT NULL, CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_6bb58f2b6e30cb51a6504599f41" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_26d8aec71ae9efbe468043cd2b9" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_1e96d587fe4a450cbea2476d3ec" FOREIGN KEY ("transferToAccountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_86e965e74f9cc66149cf6c90f64" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "FK_13e8b2a21988bec6fdcbb1fa741" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "loan_payments" ADD CONSTRAINT "FK_c0268488cc84d23c1e5c6c1910d" FOREIGN KEY ("loanId") REFERENCES "loans"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "loans" ADD CONSTRAINT "FK_4c2ab4e556520045a2285916d45" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "savings_goals" ADD CONSTRAINT "FK_016b69b77386ed555edf7c66620" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "savings_goals" ADD CONSTRAINT "FK_ca7be772ea270170037a2cb6341" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_settings" ADD CONSTRAINT "FK_5a8ffc3b89343043c9440d631e2" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD CONSTRAINT "FK_3aa23c0a6d107393e8b40e3e2a6" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP CONSTRAINT "FK_3aa23c0a6d107393e8b40e3e2a6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_settings" DROP CONSTRAINT "FK_5a8ffc3b89343043c9440d631e2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "savings_goals" DROP CONSTRAINT "FK_ca7be772ea270170037a2cb6341"`,
    );
    await queryRunner.query(
      `ALTER TABLE "savings_goals" DROP CONSTRAINT "FK_016b69b77386ed555edf7c66620"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loans" DROP CONSTRAINT "FK_4c2ab4e556520045a2285916d45"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loan_payments" DROP CONSTRAINT "FK_c0268488cc84d23c1e5c6c1910d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "FK_13e8b2a21988bec6fdcbb1fa741"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_86e965e74f9cc66149cf6c90f64"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_1e96d587fe4a450cbea2476d3ec"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_26d8aec71ae9efbe468043cd2b9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_6bb58f2b6e30cb51a6504599f41"`,
    );
    await queryRunner.query(`DROP TABLE "accounts"`);
    await queryRunner.query(`DROP TYPE "public"."accounts_type_enum"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "notification_settings"`);
    await queryRunner.query(`DROP TABLE "savings_goals"`);
    await queryRunner.query(`DROP TABLE "loans"`);
    await queryRunner.query(`DROP TABLE "loan_payments"`);
    await queryRunner.query(`DROP TABLE "categories"`);
    await queryRunner.query(`DROP TYPE "public"."categories_type_enum"`);
    await queryRunner.query(`DROP TABLE "transactions"`);
    await queryRunner.query(`DROP TYPE "public"."transactions_type_enum"`);
  }
}
