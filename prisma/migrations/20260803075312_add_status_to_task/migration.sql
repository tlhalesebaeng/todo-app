/*
  Warnings:

  - Added the required column `statusId` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Task" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "statusId" INTEGER NOT NULL,
    "topicId" INTEGER NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Task_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Task_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Task" ("archived", "createdAt", "description", "dueDate", "id", "title", "topicId", "updatedAt") SELECT "archived", "createdAt", "description", "dueDate", "id", "title", "topicId", "updatedAt" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
CREATE UNIQUE INDEX "Task_title_key" ON "Task"("title");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
