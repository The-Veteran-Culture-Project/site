// Simple in-memory store for temporary login sessions (development only)
const tempSessions = new Map();

export function setTempSession(userId: string): string {
  const sessionId = Math.random().toString(36).substring(2, 15);
  const sessionData = {
    userId,
    timestamp: Date.now(),
    expires: Date.now() + 300000 // 5 minutes
  };
  tempSessions.set(sessionId, sessionData);
  
  // Clean up expired sessions
  for (const [id, data] of tempSessions.entries()) {
    if (Date.now() > data.expires) {
      tempSessions.delete(id);
    }
  }
  
  console.log("🔒 TEMP SESSION: Created session", sessionId, "for user", userId);
  return sessionId;
}

export function getTempSession(sessionId: string) {
  const session = tempSessions.get(sessionId);
  if (!session) {
    console.log("🔒 TEMP SESSION: Session not found:", sessionId);
    return null;
  }
  
  if (Date.now() > session.expires) {
    tempSessions.delete(sessionId);
    console.log("🔒 TEMP SESSION: Session expired:", sessionId);
    return null;
  }
  
  console.log("🔒 TEMP SESSION: Session found:", sessionId, "for user", session.userId);
  return session;
}

export function clearTempSession(sessionId: string) {
  tempSessions.delete(sessionId);
  console.log("🔒 TEMP SESSION: Session cleared:", sessionId);
}
