import { eq, lte } from "astro:db";

import type { Database } from "@astrojs/db/runtime";
import type { Adapter, DatabaseSession, DatabaseUser, UserId } from "lucia";
import { User, Session } from "astro:db";

type SessionTable = typeof Session;
type UserTable = typeof User;

export class AstroDBAdapter implements Adapter {
  private db: Database;

  private sessionTable: typeof Session;
  private userTable: typeof User;

  constructor(db: Database, sessionTable: SessionTable, userTable: UserTable) {
    this.db = db;
    this.sessionTable = sessionTable;
    this.userTable = userTable;
  }

  public async deleteSession(sessionId: string): Promise<void> {
    await this.db
      .delete(this.sessionTable)
      .where(eq(this.sessionTable.id, sessionId));
  }

  public async deleteUserSessions(userId: UserId): Promise<void> {
    await this.db
      .delete(this.sessionTable)
      .where(eq(this.sessionTable.userId, userId));
  }

  public async getSessionAndUser(
    sessionId: string,
  ): Promise<[session: DatabaseSession | null, user: DatabaseUser | null]> {
    const result = await this.db
      .select({
        user: this.userTable,
        session: this.sessionTable,
      })
      .from(this.sessionTable)
      .innerJoin(
        this.userTable,
        eq(this.sessionTable.userId, this.userTable.id),
      )
      .where(eq(this.sessionTable.id, sessionId))
      .get();
    if (!result) return [null, null];
    return [
      transformIntoDatabaseSession(result.session),
      transformIntoDatabaseUser(result.user),
    ];
  }

  public async getUserSessions(userId: UserId): Promise<DatabaseSession[]> {
    const result = await this.db
      .select()
      .from(this.sessionTable)
      .where(eq(this.sessionTable.userId, userId))
      .all();
    return result.map((val) => {
      return transformIntoDatabaseSession(val);
    });
  }

  public async setSession(session: DatabaseSession): Promise<void> {
    await this.db
      .insert(this.sessionTable)
      .values({
        id: session.id,
        userId: session.userId,
        expiresAt: session.expiresAt,
        ...session.attributes,
      })
      .run();
  }

  public async updateSessionExpiration(
    sessionId: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.db
      .update(this.sessionTable)
      .set({
        expiresAt: expiresAt,
      })
      .where(eq(this.sessionTable.id, sessionId))
      .run();
  }

  public async deleteExpiredSessions(): Promise<void> {
    await this.db
      .delete(this.sessionTable)
      .where(lte(this.sessionTable.expiresAt, new Date()));
  }
}

function transformIntoDatabaseSession(raw: any): DatabaseSession {
  const { id, userId, expiresAt, ...attributes } = raw;
  return {
    userId,
    id,
    expiresAt,
    attributes,
  };
}

function transformIntoDatabaseUser(raw: any): DatabaseUser {
  const { id, ...attributes } = raw;
  return {
    id,
    attributes,
  };
}
