export function mapPostForUser(post, userId, canAccess) {
    const votes = post.votes ?? [];
    const likes = votes.filter(v => v.value === 1).length;
    const dislikes = votes.filter(v => v.value === -1).length;

    const myVote = userId
        ? votes.find(v => v.userId === userId)?.value ?? 0
        : 0;
    const hasMedia = !!post.mediaUrl;
    const placeholderUrl = "/placeholder.jpg";
    return {
        id: post.id,
        title: post.title,
        createdAt: post.createdAt,
        isPaid: post.isPaid,

        authorId: post.authorId,
        author: post.author,

        canAccess,
        mediaUrl: canAccess ? post.mediaUrl : (hasMedia ? placeholderUrl : null),
        content: canAccess ? post.content : null,
        previewText: canAccess ? null : post.previewText,
        likes,
        dislikes,
        myVote
    };
}
