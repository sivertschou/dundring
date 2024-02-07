import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const migrateAddTableMailAuthentication = async () => {
  const migrationName = 'add_table_mail_authentication';
  try {
    await prisma.$transaction(async (tx) => {
      const isMigrated = await tx.dataMigration.findUnique({
        where: { name: migrationName },
      });

      if (isMigrated) {
        console.info(`[${migrationName}]: data already migrated`);
        return;
      }

      console.info(`[${migrationName}]: start migration`);

      const users = await tx.user.findMany();

      console.info(`[${migrationName}]: ${users.length} users found`);

      await Promise.all(
        users.map((user) =>
          tx.mailAuthentication.create({
            data: {
              userId: user.id,
              mail: user.mail,
            },
          })
        )
      );

      console.info(`[${migrationName}]: add entry in DataMigration`);
      await tx.dataMigration.create({ data: { name: migrationName } });
    });

    console.info(`[${migrationName}]: migration done`);
  } catch (e) {
    console.error(
      `Something went wrong during data migration for '${migrationName}'`,
      e
    );
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

export const migrate = async () => {
  await migrateAddTableMailAuthentication();
};
migrate();
