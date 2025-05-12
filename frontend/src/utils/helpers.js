// Generate a consistent conversation ID from two user IDs
export const generateConversationId = (id1, id2) => {
  // Sort IDs to ensure consistency regardless of parameter order
  const sortedIds = [id1, id2].sort();
  return `${sortedIds[0]}_${sortedIds[1]}`;
};