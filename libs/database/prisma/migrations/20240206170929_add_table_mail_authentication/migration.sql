-- CreateTable
CREATE TABLE "MailAuthentication" (
    "mail" TEXT NOT NULL,
    "userId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "MailAuthentication_mail_key" ON "MailAuthentication"("mail");

-- CreateIndex
CREATE UNIQUE INDEX "MailAuthentication_userId_key" ON "MailAuthentication"("userId");

-- AddForeignKey
ALTER TABLE "MailAuthentication" ADD CONSTRAINT "MailAuthentication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
