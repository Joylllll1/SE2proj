export function flattenRatingComments(comments = []) {
  const flatList = [];

  comments.forEach((comment) => {
    flatList.push({ ...comment, itemType: 'comment' });
    (comment.replies || []).forEach((reply) => {
      flatList.push({ ...reply, itemType: 'reply' });
    });
  });

  return flatList;
}
