export function getConversationId(userA: string, userB: string): string {
  return [userA, userB].sort().join("__");
}
